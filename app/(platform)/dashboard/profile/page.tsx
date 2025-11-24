import type { Metadata } from "next";
import UserMetaCard from "@/components/user-profile/UserMetaCard";
import UserInfoCard from "@/components/user-profile/UserInfoCard";
import UserAddressCard from "@/components/user-profile/UserAddressCard";

export const metadata: Metadata = {
  title: "Profile",
  description: "User Profile Page",
};

export default function Profile() {
  return (
    <div className="space-y-6">
      <UserMetaCard />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <UserInfoCard />
        <UserAddressCard />
      </div>
    </div>
  );
}