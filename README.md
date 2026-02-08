# Zentik Notifier

<p align="center">
  <img src="https://raw.githubusercontent.com/Zentik-notifier/docs/refs/heads/main/static/logos/brand-logo.png" alt="Zentik" width="300" />
</p>

**One place for all your alerts.** Zentik is a notification hub: receive alerts from your systems and get them on your devices with **rich push** — self-host the backend or use the hosted app and focus on what matters.

---

## Why Zentik?

- **Mobile-first, iOS at heart** — Rich notifications, custom actions, multiple media, and deep integration with the Apple ecosystem (see [iOS features](#-ios-features) below).
- **Flexible** — Send from webhooks, APIs, or many integrations. Organize with buckets and tokens. Transform payloads with parsers and templates.
- **Your data, your choice** — Self-host everything, or use the official cloud for **iOS passthrough** and let us handle the Apple infrastructure while notifications stay **fully encrypted** (see [Cloud & privacy](#-cloud--privacy)).

---

## iOS features

Zentik on iOS is built to make notifications useful, not noisy.

| Feature | What you get |
|--------|---------------|
| **Apple Watch** | Notifications on your wrist; sync and manage from the Watch app. |
| **iOS widget** | Glance at recent notifications or unread count from your Home Screen. |
| **Custom notification content** | Notification Service Extension: rich content, media, and custom UI right in the notification (no need to open the app). |
| **Custom Share Extension** | Share from Photos, Safari, or any app: pick a bucket, set title and message, add more media, choose delivery type and options (snooze, postpone) — then send to Zentik without opening the app. |
| **Custom actions — many types, no hard limit** | Snooze, postpone, mark as read, delete, open URL, trigger webhooks, and more. Define multiple actions per bucket; combine different types in a single notification. |
| **Multiple media in one notification** | Expanded notification can show several images, video, or other attachments at once — no "one image only" limit. |

---

## Screenshots

Overview of the app on each device.

### iPhone (iOS)

| | | | |
|---|---|---|---|
| <img src="org/profile/assets/ios/buckets-list.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/buckets-list-light.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/notifications-list-compact.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/notifications-list-light.jpg" alt="iOS" width="180" /> |
| <img src="org/profile/assets/ios/notifications-list-dark.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/notifications-list-dark-2.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/notifications-drop-screen.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/notification-expanded-with-actions.jpg" alt="iOS" width="180" /> |
| <img src="org/profile/assets/ios/notification-detail.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/notification-detail-actions.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/media-full-screen.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/push-notification-open.jpg" alt="iOS" width="180" /> |
| <img src="org/profile/assets/ios/ios-widget.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/create-bucket.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/payload-mappers.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/payload-mapper.jpg" alt="iOS" width="180" /> |
| <img src="org/profile/assets/ios/gallery.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/login.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/login-sso.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/app-settings.jpg" alt="iOS" width="180" /> |
| <img src="org/profile/assets/ios/access-tokens.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/user-profile-dropdown.jpg" alt="iOS" width="180" /> | <img src="org/profile/assets/ios/IMG_8173.PNG" alt="Share Extension" width="180" /> | |

### Apple Watch

| | | | |
|---|---|---|---|
| <img src="org/profile/assets/watch/incoming-3E305D37-1A14-469B-8835-934BE5FF3164.PNG" alt="Watch" width="140" /> | <img src="org/profile/assets/watch/incoming-54F295B2-10EC-4339-855F-99387D02FFB5.PNG" alt="Watch" width="140" /> | <img src="org/profile/assets/watch/incoming-6E0BFE95-7B07-4BD8-94E1-1F6CBEC52630.PNG" alt="Watch" width="140" /> | <img src="org/profile/assets/watch/incoming-7F1BA14D-91CF-4E26-A8CC-F0DAF735DA54.PNG" alt="Watch" width="140" /> |
| <img src="org/profile/assets/watch/incoming-92CD99F4-8EB5-4297-B93B-1BAF00DEE68E.PNG" alt="Watch" width="140" /> | <img src="org/profile/assets/watch/incoming-B38B0676-99F8-4B66-B98C-24E1F785F2F4.PNG" alt="Watch" width="140" /> | <img src="org/profile/assets/watch/incoming-BE8C3711-953A-4B53-A550-1B3DFF5BFF9F.PNG" alt="Watch" width="140" /> | |

### iPad / macOS

| | | | |
|---|---|---|---|
| <img src="org/profile/assets/ipad-macos/IMG_0024_2732x2048.jpg" alt="iPad/macOS" width="220" /> | <img src="org/profile/assets/ipad-macos/IMG_0026_2732x2048.jpg" alt="iPad/macOS" width="220" /> | <img src="org/profile/assets/ipad-macos/IMG_0027_2732x2048.jpg" alt="iPad/macOS" width="220" /> | <img src="org/profile/assets/ipad-macos/IMG_0028_2732x2048.jpg" alt="iPad/macOS" width="220" /> |
| <img src="org/profile/assets/ipad-macos/IMG_0029_2732x2048.jpg" alt="iPad/macOS" width="220" /> | <img src="org/profile/assets/ipad-macos/IMG_0030_2732x2048.jpg" alt="iPad/macOS" width="220" /> | <img src="org/profile/assets/ipad-macos/IMG_0031_2732x2048.jpg" alt="iPad/macOS" width="220" /> | <img src="org/profile/assets/ipad-macos/IMG_0032_2732x2048.jpg" alt="iPad/macOS" width="220" /> |
| <img src="org/profile/assets/ipad-macos/IMG_0033_2732x2048.jpg" alt="iPad/macOS" width="220" /> | <img src="org/profile/assets/ipad-macos/IMG_0034_2732x2048.jpg" alt="iPad/macOS" width="220" /> | <img src="org/profile/assets/ipad-macos/IMG_0035_2732x2048.jpg" alt="iPad/macOS" width="220" /> | <img src="org/profile/assets/ipad-macos/IMG_0036_2732x2048.jpg" alt="iPad/macOS" width="220" /> |
| <img src="org/profile/assets/ipad-macos/IMG_0037_2732x2048.jpg" alt="iPad/macOS" width="220" /> | | | |

---

## Cloud & privacy

**Official cloud server and iOS:**  
If you use the **hosted Zentik app** (or point the app at the official cloud), we offer **passthrough to Apple Push Notification service (APNs)**. That means you don't have to configure APNs, certificates, or the rest of the Apple infrastructure yourself — we handle that. Ideal for self-hosters who want full control of their data but want to avoid the complexity of the Apple side.

**To use iOS passthrough you need a passthrough token:**  
1. **Request a token** on the [self-service token request page](https://notifier.zentik.app/self-service/token-requests).  
2. **Wait for confirmation** — once your request is approved, the token will be available.  
3. **Use it in the app** — as an **admin**, open **Server settings**; the token will appear in a **selector**. Select it to enable **iOS passthrough** for your self-hosted instance.

**Encryption:**  
Notifications are **end-to-end encrypted** for both the Zentik cloud server and APNs. The content is encrypted in transit and at rest; we don't have access to the decrypted payload. You keep privacy whether you self-host or use the cloud.

---

## Quick links

| Section | Description |
|--------|-------------|
| [**Docs**](https://notifier-docs.zentik.app/) | Full documentation (intro, buckets, notifications, self-hosted) |
| [**First steps**](https://notifier-docs.zentik.app/docs/intro#first-steps) | Register, create a bucket, send your first notification |
| [**Buckets**](https://notifier-docs.zentik.app/docs/notifications/buckets/creation) | Create buckets, tokens, and magic codes |
| [**Webhooks**](https://notifier-docs.zentik.app/docs/webhooks) | Send notifications via HTTP |
| [**Self-hosted**](https://notifier-docs.zentik.app/docs/self-hosted/installation) | Install and run Zentik on your server |
| [**Request a passthrough token**](https://notifier.zentik.app/self-service/token-requests) | Required for self-hosted instances using cloud iOS/APNs passthrough |

---

## Integrations

Connect your stack and get notifications in Zentik:

| Integration | What it does |
|-------------|----------------|
| [**NTFY**](https://notifier-docs.zentik.app/docs/integrations/ntfy) | Proxy NTFY topics to Zentik (subscribe + publish) |
| [**Home Assistant**](https://notifier-docs.zentik.app/docs/integrations/homeassistant) | HACS: `notify` service for automations |
| [**Uptime Kuma**](https://notifier-docs.zentik.app/docs/integrations/uptime-kuma) | Webhook for monitoring (up/down, status) |
| [**Scrypted**](https://notifier-docs.zentik.app/docs/integrations/scrypted) | Push from Scrypted (cameras, NVR) |
| [**Servarr**](https://notifier-docs.zentik.app/docs/integrations/servarr) | Sonarr, Radarr, and the *arr stack |
| [**Authentik**](https://notifier-docs.zentik.app/docs/integrations/authentik) | Alerts and events from Authentik |
| [**Unraid**](https://notifier-docs.zentik.app/docs/integrations/unraid) | Notifications from Unraid |

---

## Try it

- **Web (PWA):** [notifier.zentik.app](https://notifier.zentik.app)
- **iOS:** [App Store](https://apps.apple.com/de/app/zentik-notifier/id6749312723) · [TestFlight](https://testflight.apple.com/join/dFqETQEm)

Questions or ideas? [Open a discussion or a PR](https://github.com/Zentik-notifier/zentik-notifier), or join [Discord](https://discord.gg/DzhJ4s7N).
