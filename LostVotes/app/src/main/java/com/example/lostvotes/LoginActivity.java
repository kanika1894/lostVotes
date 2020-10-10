package com.example.lostvotes;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NotificationCompat;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import java.util.Random;

public class LoginActivity extends AppCompatActivity {

    EditText aadhar_et, otp_et;
    Button otp_button, submit_button;
    Boolean valid_aadhar = false;

    final int random_otp = new Random().nextInt(8999) + 1000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        aadhar_et = (EditText)findViewById(R.id.aadhar);
        otp_et = (EditText)findViewById(R.id.otp);
        otp_button = (Button)findViewById(R.id.otp_button);
        submit_button = (Button)findViewById(R.id.submit);


        aadhar_et.addTextChangedListener(new TextWatcher()  {

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }

            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void afterTextChanged(Editable s)  {
                if (aadhar_et.getText().toString().length() <= 15) {
                    aadhar_et.setError("Must be 16 digits");
                } else {
                    aadhar_et.setError(null);
                    valid_aadhar= true;
                }
            }
        });


        otp_button.setOnClickListener(new View.OnClickListener() {
            @RequiresApi(api = Build.VERSION_CODES.O)
            @Override
            public void onClick(View view) {

                if (valid_aadhar)
                notificationDialog();

                else
                    Toast.makeText(LoginActivity.this, "Enter Valid Aadhar Number First", Toast.LENGTH_SHORT).show();
            }
        });



        submit_button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

                if (otp_et.getText().toString().equals(String.valueOf(random_otp))) {

                    Intent intent = new Intent(LoginActivity.this, HomeActivity.class);
                    startActivity(intent);
                    finish();
                }
                else {
                    Toast.makeText(LoginActivity.this, "Invalid OTP", Toast.LENGTH_SHORT).show();
                }
            }
        });
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private void notificationDialog() {
        NotificationManager notificationManager = (NotificationManager)       getSystemService(Context.NOTIFICATION_SERVICE);
        String NOTIFICATION_CHANNEL_ID = "notification_channel_id";
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            @SuppressLint("WrongConstant") NotificationChannel notificationChannel = new NotificationChannel(NOTIFICATION_CHANNEL_ID, "Aadhar Otp Notification", NotificationManager.IMPORTANCE_MAX);
            // Configure the notification channel.
            notificationChannel.setDescription("Sample Channel description");
            notificationChannel.enableLights(true);
            notificationChannel.setLightColor(R.color.colorAccent);
            notificationManager.createNotificationChannel(notificationChannel);
        }
        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID);
        notificationBuilder.setAutoCancel(true)
                .setDefaults(Notification.DEFAULT_ALL)
                .setWhen(System.currentTimeMillis())
                .setSmallIcon(R.mipmap.ic_launcher)
                //.setPriority(Notification.PRIORITY_MAX)
                .setContentTitle("OTP")
                .setContentText("Your OTP is " + random_otp)
                .setContentInfo("Aadhar Otp");
        notificationManager.notify(1, notificationBuilder.build());
    }
}