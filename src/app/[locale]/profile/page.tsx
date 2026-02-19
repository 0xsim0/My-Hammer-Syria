import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function ProfileRedirectPage() {
  const session = await auth();
  const locale = await getLocale();

  if (!session?.user) {
    redirect(`/${locale}/login`);
  }

  redirect(`/${locale}/profile/${session.user.id}`);
}
