import LogInForm from "../../../components/auth/LogInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log In Page",
};

export default function LogIn() {
  return <LogInForm />;
}