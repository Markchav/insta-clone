// src/pages/privacy.js

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-6 py-12 bg-white text-gray-800">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-2">
        This is a personal educational project created to demonstrate Firebase
        Authentication and basic session management.
      </p>
      <p className="mb-2">
        We only collect login credentials (email/password) through Firebase Auth
        to manage sessions. No data is shared or stored outside Firebase.
      </p>
      <p className="mt-6 text-sm text-gray-500">
        This project is not affiliated with Instagram or Meta.
      </p>
    </div>
  );
}
