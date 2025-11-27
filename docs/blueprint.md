# **App Name**: MacroSleep PWA

## Core Features:

- User Authentication: Secure user sign-up, login, and profile management using Firebase Authentication, including email/password and Google sign-in.
- Sleep Tracking: Log sleep start and end times to calculate total sleep duration, stored under `/users/{uid}/sleep_logs` in Firestore.
- Macro Tracking: Add meals with calorie, protein, carb, and fat details. Calculate daily macro totals and store data under `/users/{uid}/macro_logs` in Firestore.
- Data Visualization: Display sleep and macro data using interactive charts for weekly and monthly analysis. Display using pie and bar charts.
- Personalized Dashboard: Provide a daily summary of sleep duration and macro intake, with visual indicators for goal progress.
- Offline Support: Enable offline functionality using service workers to cache static assets and Firestore reads.
- Profile Management: Allow users to set daily macro goals, edit personal details, and upload a profile picture using Firebase Storage.

## Style Guidelines:

- Primary color: Dark teal (#008080) for a calm, health-focused feel.
- Background color: Light grayish-teal (#E0EEEE) for a serene backdrop.
- Accent color: Muted green (#90EE90) for interactive elements and progress indicators.
- Body and headline font: 'Inter' (sans-serif) for a modern, neutral, and readable experience.
- Use clean, minimalist icons to represent sleep patterns and macro nutrients.
- Mobile-first, responsive design with a clear, intuitive layout for easy data input and visualization.
- Subtle animations for feedback during data input and transitions between sections.