import { Suspense } from "react";
import CurrentMalaysianBusinessAddressClient from "./BusinessAddressClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CurrentMalaysianBusinessAddressClient />
    </Suspense>
  );
}
