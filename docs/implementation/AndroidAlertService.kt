package com.leaderguard.security

import android.app.*
import android.content.Intent
import android.os.IBinder
import android.speech.tts.TextToSpeech
import androidx.core.app.NotificationCompat
import java.util.*

class AndroidAlertService : Service(), TextToSpeech.OnInitListener {
    private lateinit var tts: TextToSpeech

    override fun onCreate() {
        super.onCreate()
        tts = TextToSpeech(this, this)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val message = intent?.getStringExtra("alert_message") ?: "Warning! Emergency detected."
        
        // Show Foreground Notification
        val notification = NotificationCompat.Builder(this, "ALERT_CHANNEL")
            .setContentTitle("Leader Guard: EMERGENCY")
            .setContentText(message)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()

        startForeground(1, notification)

        // Trigger Emergency Activity
        val emergencyIntent = Intent(this, EmergencyActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            addFlags(Intent.FLAG_ACTIVITY_SHOW_WHEN_LOCKED)
            addFlags(Intent.FLAG_ACTIVITY_TURN_SCREEN_ON)
            putExtra("message", message)
        }
        startActivity(emergencyIntent)

        return START_STICKY
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts.language = Locale.getDefault()
            // Speak the warning
            tts.speak("Warning! High risk detected. Please move to safety immediately.", TextToSpeech.QUEUE_FLUSH, null, null)
        }
    }

    private fun createNotificationChannel() {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
            val channel = NotificationChannel("ALERT_CHANNEL", "Emergency Alerts", NotificationManager.IMPORTANCE_HIGH)
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        tts.stop()
        tts.shutdown()
        super.onDestroy()
    }
}
