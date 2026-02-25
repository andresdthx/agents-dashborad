import { redirect } from "next/navigation";

// Root: middleware handles auth, redirect authenticated to dashboard
export default function RootPage() {
  redirect("/dashboard");
}
