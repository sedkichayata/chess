import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import { WebView } from "react-native-webview";

export default function Stripe() {
  const { checkoutUrl, masterId, sessionId, type } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === "web") {
      if (checkoutUrl) {
        const popup = window.open(checkoutUrl, "_blank", "popup");
        const checkClosed = setInterval(() => {
          try {
            if (
              popup.closed ||
              popup.location.href.includes(
                process.env.EXPO_PUBLIC_PROXY_BASE_URL ||
                  process.env.EXPO_PUBLIC_BASE_URL,
              )
            ) {
              clearInterval(checkClosed);
              popup.close();
              router.back();
            }
          } catch (e) {}
        }, 1000);
      } else {
        router.back();
      }
    }
  }, [checkoutUrl, router]);

  const handleWebViewClose = () => {
    router.back();
  };

  const handleShouldStartLoadWithRequest = (request) => {
    const baseUrl =
      process.env.EXPO_PUBLIC_PROXY_BASE_URL ||
      process.env.EXPO_PUBLIC_BASE_URL;
    if (request.url.includes(baseUrl)) {
      // Check if payment was successful
      if (request.url.includes("session_id=")) {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("session_id");
        const paymentType = url.searchParams.get("type");
        const masterId = url.searchParams.get("master_id");
        const bookingSessionId = url.searchParams.get("booking_session_id");

        // Verify payment in background
        fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            type: paymentType,
            masterId,
            bookingSessionId,
          }),
        })
          .then(() => {
            handleWebViewClose();
          })
          .catch(() => {
            handleWebViewClose();
          });
      } else {
        handleWebViewClose();
      }
      return false;
    }
    return true;
  };

  if (Platform.OS === "web") {
    return null;
  }

  return (
    <WebView
      source={{ uri: checkoutUrl }}
      style={{ flex: 1 }}
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
    />
  );
}
