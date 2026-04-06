import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useApp } from "@/context/AppContext";

export default function Index() {
  const { isLoggedIn } = useApp();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn) {
        router.replace("/(tabs)/home" as never);
      } else {
        router.replace("/auth/splash" as never);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  return null;
}
