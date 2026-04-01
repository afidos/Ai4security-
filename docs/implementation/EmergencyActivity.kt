package com.leaderguard.security

import android.os.Bundle
import android.os.CountDownTimer
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import java.util.concurrent.TimeUnit

class EmergencyActivity : AppCompatActivity() {
    private lateinit var countdownText: TextView
    private lateinit var messageText: TextView
    private lateinit var confirmButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_emergency)

        // Show over lock screen
        window.addFlags(
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD or
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
        )

        countdownText = findViewById(R.id.countdownText)
        messageText = findViewById(R.id.messageText)
        confirmButton = findViewById(R.id.confirmButton)

        val message = intent.getStringExtra("message") ?: "Emergency Alert"
        messageText.text = message

        // 15 Minute Countdown
        object : CountDownTimer(15 * 60 * 1000, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val minutes = TimeUnit.MILLISECONDS.toMinutes(millisUntilFinished)
                val seconds = TimeUnit.MILLISECONDS.toSeconds(millisUntilFinished) % 60
                countdownText.text = String.format("%02d:%02d", minutes, seconds)
            }

            override fun onFinish() {
                countdownText.text = "00:00"
            }
        }.start()

        confirmButton.setOnClickListener {
            // In a real app, send confirmation to server
            finish()
        }
    }
}
