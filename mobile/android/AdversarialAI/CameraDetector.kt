package com.leaderguard.security.adversarial

import android.content.Context
import android.graphics.Bitmap
import android.util.Log
import org.tensorflow.lite.Interpreter
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.io.FileInputStream
import java.nio.channels.FileChannel

/**
 * CameraDetector: Uses TensorFlow Lite to detect surveillance cameras and drones in camera frames.
 * Can be used with the phone's camera or an external USB camera.
 */
class CameraDetector(private val context: Context) {

    private var interpreter: Interpreter? = null
    private val modelPath = "models/surveillance_detector.tflite" // Model must be in assets

    init {
        try {
            val model = loadModelFile()
            interpreter = Interpreter(model)
            Log.d("CameraDetector", "TFLite model loaded successfully")
        } catch (e: Exception) {
            Log.e("CameraDetector", "Error loading TFLite model: ${e.message}")
        }
    }

    private fun loadModelFile(): ByteBuffer {
        val fileDescriptor = context.assets.openFd(modelPath)
        val inputStream = FileInputStream(fileDescriptor.fileDescriptor)
        val fileChannel = inputStream.channel
        val startOffset = fileDescriptor.startOffset
        val declaredLength = fileDescriptor.declaredLength
        return fileChannel.map(FileChannel.MapMode.READ_ONLY, startOffset, declaredLength)
    }

    /**
     * Detects surveillance objects in the current frame.
     * @param bitmap: The current camera frame.
     * @return: A list of detected object labels (e.g., "CCTV", "DRONE").
     */
    fun detect(bitmap: Bitmap? = null): List<String> {
        if (interpreter == null || bitmap == null) return emptyList()

        // 1. Pre-process the bitmap (resize, normalize)
        val inputBuffer = preprocessBitmap(bitmap)
        
        // 2. Run inference
        val outputMap = mutableMapOf<Int, Any>()
        val locations = Array(1) { Array(10) { FloatArray(4) } }
        val classes = Array(1) { FloatArray(10) }
        val scores = Array(1) { FloatArray(10) }
        val numDetections = FloatArray(1)

        outputMap[0] = locations
        outputMap[1] = classes
        outputMap[2] = scores
        outputMap[3] = numDetections

        interpreter?.runForMultipleInputsOutputs(arrayOf(inputBuffer), outputMap)

        // 3. Post-process results
        val detectedObjects = mutableListOf<String>()
        for (i in 0 until 10) {
            if (scores[0][i] > 0.6) { // Confidence threshold
                val classId = classes[0][i].toInt()
                val label = getLabel(classId)
                detectedObjects.add(label)
                Log.i("CameraDetector", "Detected: $label with score ${scores[0][i]}")
            }
        }

        return detectedObjects
    }

    private fun preprocessBitmap(bitmap: Bitmap): ByteBuffer {
        // Resize to model input size (e.g., 300x300 for MobileNet SSD)
        val resizedBitmap = Bitmap.createScaledBitmap(bitmap, 300, 300, true)
        val inputBuffer = ByteBuffer.allocateDirect(1 * 300 * 300 * 3 * 4)
        inputBuffer.order(ByteOrder.nativeOrder())
        
        val intValues = IntArray(300 * 300)
        resizedBitmap.getPixels(intValues, 0, 300, 0, 0, 300, 300)
        
        for (pixelValue in intValues) {
            inputBuffer.putFloat(((pixelValue shr 16 and 0xFF) - 127.5f) / 127.5f)
            inputBuffer.putFloat(((pixelValue shr 8 and 0xFF) - 127.5f) / 127.5f)
            inputBuffer.putFloat(((pixelValue and 0xFF) - 127.5f) / 127.5f)
        }
        return inputBuffer
    }

    private fun getLabel(classId: Int): String {
        return when (classId) {
            0 -> "CCTV"
            1 -> "DRONE"
            2 -> "HIDDEN_CAMERA"
            else -> "UNKNOWN"
        }
    }
}
