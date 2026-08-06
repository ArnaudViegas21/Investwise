"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToast, type ToastTone } from "@/components/ToastProvider";

const notices: Record<
  string,
  {
    tone: ToastTone;
    title: string;
    message?: string;
  }
> = {
  "goal-created": {
    tone: "success",
    title: "Goal created",
    message: "Your saved goal is ready to review."
  },
  "goal-updated": {
    tone: "success",
    title: "Goal updated",
    message: "The latest assumptions have been saved."
  },
  "goal-deleted": {
    tone: "success",
    title: "Goal deleted",
    message: "The saved goal was removed."
  }
};

export default function ToastQueryListener() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notify } = useToast();

  useEffect(() => {
    const notice = searchParams.get("notice");

    if (!notice || !notices[notice]) {
      return;
    }

    notify(notices[notice]);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("notice");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false
    });
  }, [notify, pathname, router, searchParams]);

  return null;
}
