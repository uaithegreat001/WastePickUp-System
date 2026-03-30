# WastePickup System Explaination

WastePickup System is a waste collection management system. This system provides a platform for managing waste request, processing payments, handling user authentication and it contain admin panel for routing, scheduling and managing the collection requests.

## Project Overview

The WastePickup System is split into two main parts:
1. **Frontend:** Built with React, Vite, TailwindCSS, and Firebase. It includes mapping features via Leaflet and payment integration through Paystack.
2. **Backend:** Powered by Node.js, Express, and Firebase Admin. It handles server-side operations, API requests, and routing.

---

## Installation Process

Follow these steps to set up the project on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)

### 1. Clone & Install Dependencies

**For the Frontend:**
Open your terminal in the root directory of the project and run:
```bash
npm install
```

**For the Backend:**
Navigate to the backend directory and install its dependencies:
```bash
cd backend
npm install
```

### 2. Start the Development Servers

You can easily start both the frontend and backend servers together from the root directory. 

**To run the frontend:**
```bash
# In the root directory:
npm run dev
```

**To run the backend:**
```bash
# In the root directory:
npm run server:dev
```

*(This starts the backend using `nodemon` on its configured port).*

---

## Environment Variables (.env)

The project uses `.env` files to securely store API keys and system settings. **Never share these files or upload them to GitHub.**

### Frontend Environment Variables
Create a `.env.local` file in the **root directory** with the following structure:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

VITE_API_URL=http://localhost:your_backend_port
VITE_CONFIRM_PAYMENT_URL=your_frontend_url
VITE_VERIFY_PAYMENT_URL=your_frontend_url/verify-payment
VITE_VERIFY_EMAIL_URL=your_frontend_url/admin/reply-message

VITE_ADMIN_SUPER_KEY=your_admin_secret_key
```

### Where to get these keys?

- **Firebase Keys:** Go to your [Firebase Console](https://console.firebase.google.com/), pick your project, open Project Settings, and copy the Web App configuration keys.
- **Paystack Keys:** Log in to your [Paystack Dashboard](https://dashboard.paystack.com/), go to Settings > API Keys & Webhooks, and grab your Public Key (use the Test key for development).
- **VITE_ADMIN_SUPER_KEY:** This is a custom secret string of your choice used to secure admin-specific actions between the frontend.

---

## Dependencies Overview

### Frontend (Root `package.json`)
- **React & ReactDOM:** Core UI library.
- **Vite:** Frontend build tool.
- **TailwindCSS:** Utility-first CSS framework for styling.
- **Firebase:** Authentication and database services.
- **React Leaflet & Leaflet:** Interactive maps.
- **React Paystack:** Integrating Paystack payment gateway.
- **Axios:** Handling API requests.
- **React Router Dom:** For page navigation.
- **React Hot Toast:** For premium notification popups.
- **HugeIcons:** Icon resources.

### Backend (`backend/package.json`)
- **Express:** Web server framework.
- **Firebase Admin:** Admin-level access to Firebase services.
- **Axios:** Server-side HTTP requests.
- **Dotenv:** Loading environment variables securely.
- **Cors:** Managing Cross-Origin Resource Sharing.
- **Nodemon (dev):** Automatically restarts backend server on code changes.
