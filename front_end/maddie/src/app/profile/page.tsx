import type { Metadata } from "next";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserAddressCard from "@/components/user-profile/UserAddressCard";

export const metadata: Metadata = {
  title: "Profile | TailAdmin - Next.js Dashboard Template",
  description: "User profile page for TailAdmin Dashboard Template",
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      {/* User Meta Card */}
      <UserMetaCard />

      {/* Two Column Layout for Info and Address */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* User Info Card */}
        <UserInfoCard />

        {/* User Address Card */}
        <UserAddressCard />
      </div>
    </div>
  );
}
