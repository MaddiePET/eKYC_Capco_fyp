This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



## Firebase Setup

This project uses Firebase Firestore for JIM and JPN identity verification.

### 1. Create Firebase Service Accounts

Create two Firebase projects/services:
- JIM Firestore
- JPN Firestore

Download the service account JSON files.
Place the credential JSON files locally and configure the paths in `.env.local`.

Example:

```bash
serviceAccountKey-JIM.json
serviceAccountKey-JPN.json
```

Contact the project owner for the credential files.
---

### 2. Configure Environment Variables

Create a `.env.local` file:

```env
FIREBASE_JIM_SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey-JIM.json
FIREBASE_JPN_SERVICE_ACCOUNT_PATH=/absolute/path/to/serviceAccountKey-JPN.json
```

---

### 3. ## Firebase Dependencies Installation

Install Firebase Admin SDK:

```bash
npm install firebase-admin
```

If using Firebase client SDK:

```bash
npm install firebase
```

(Optional) Install Firebase CLI globally:

```bash
npm install -g firebase-tools
```

Login to Firebase:

```bash
firebase login
```
---

### 4. Firestore Collections

Required collections:

#### JIM Firestore
```text
jim_nonresidents
```

Example fields:
```json
{
  "passport_no": "MF676842",
  "full_name": "John Doe"
}
```

#### JPN Firestore
```text
jpn_citizens
```

Example fields:
```json
{
  "ic_number": "010203040506",
  "full_name": "Jane Doe"
}
```

---

### 5. Run the Application

```bash
npm run dev
```

## 6. Important Notes

- Do NOT commit Firebase service account JSON files to GitHub.
- Ensure `.gitignore` contains:

```gitignore
*.json
.env.local
```