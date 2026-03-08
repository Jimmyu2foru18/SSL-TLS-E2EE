# Cryptographically Verified Telephony

A zero-trust communication protocol designed to solve the global crisis of SMS spam and identity spoofing. By binding a phone number (MSISDN) to a hardware-backed Ed25519 key pair, 
a phone number is no longer a public target, but a secure, private endpoint.

The protocol moves from the "Open-Door" policy of the 1970s PSTN to a **"Proof-of-Permission"** model for the 21st century.

---

## Key Features

* **Cryptographic Identity:** Every phone number is tied to a unique Public Key verified via SMS-OTP.
* **End-to-End Encryption (E2EE):** All message payloads are encrypted locally using Libsodium (XSalsa20).
* **Hardware Root of Trust:** Private keys are generated and stored within the **iOS Secure Enclave** or **Android StrongBox**.
* **Signature-Based Filtering:** The signaling relay rejects any message that lacks a valid digital signature, killing spam at the protocol layer.
* **Privacy-Preserving Discovery:** Find -ready contacts using salted SHA-256 hashing—your address book never leaves your device.

---

## System Architecture

The system is divided into three primary tiers:

1.  **The Client:** A React Native/Flutter app managing the local E2EE state and hardware signatures.
2.  **The Relay:** A stateless Node.js/Go backend that routes encrypted packets via WebSockets (WSS).
3.  **The Directory:** A PostgreSQL/Redis ledger mapping hashed phone numbers to their active Public Keys.

---

## Quick Start (Developer Mode)

### 1. Clone the Repository
```bash
git clone https://github.com/Jimmyu2foru18/SSL-TLS-E2EE.git
cd SSL-TLS-E2EE
```

### 2. Configure the Relay (Backend)
Create a `.env` file in the `/server` directory:
```env
PORT=3000
DATABASE_URL=postgres://user:pass@localhost:
REDIS_URL=redis://localhost:
SMS_PROVIDER_API_KEY=your_key_here
```

### 3. Install & Launch
```bash
# Start the Backend
cd server
npm install && npm start

# Start the Mobile Client
cd client
npm install
npx react-native run-ios # or run-android
```

---

## Security

The principle of **Computational Friction**. By requiring a valid, number-bound signature for every interaction, 
we make it economically impossible for a spammer to "blast" millions of messages. To a spammer, the cost of one text equal to the cost of one verified phone line.

---

## Documentation

For deep dives into the protocol, refer to the following documents in the workspace:

* **Document 1:** [Concept Document.pdf]
* **Document 2:** [Design Document.pdf]
* **Document 3:** [User Guide Document.pdf]


