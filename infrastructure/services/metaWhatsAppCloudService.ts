import { CommunityEvent } from '../../domain/models/Event';

export interface MetaCloudBroadcastResult {
  success: boolean;
  recipientCount: number;
  messageId?: string;
}

export interface MetaCloudConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion?: string;
}

export function getMetaCloudConfigFromEnv(): MetaCloudConfig | null {
  const phoneNumberId = process.env.EXPO_PUBLIC_META_WA_PHONE_NUMBER_ID;
  const accessToken = process.env.EXPO_PUBLIC_META_WA_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) return null;
  return {
    phoneNumberId,
    accessToken,
    apiVersion: process.env.EXPO_PUBLIC_META_WA_API_VERSION || 'v21.0',
  };
}

export async function sendMetaCloudTextBroadcast(
  config: MetaCloudConfig,
  recipientPhoneNumbers: string[],
  body: string
): Promise<MetaCloudBroadcastResult> {
  const apiVersion = config.apiVersion || 'v21.0';
  const endpoint = `https://graph.facebook.com/${apiVersion}/${config.phoneNumberId}/messages`;
  let sent = 0;
  let lastMessageId: string | undefined;

  for (const to of recipientPhoneNumbers) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'text',
        text: { preview_url: true, body },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.warn('[MetaCloud] Send failed for', to, errorBody);
      continue;
    }

    const payload = (await response.json()) as { messages?: Array<{ id: string }> };
    sent += 1;
    lastMessageId = payload.messages?.[0]?.id ?? lastMessageId;
  }

  return {
    success: sent > 0,
    recipientCount: sent,
    messageId: lastMessageId,
  };
}

export async function broadcastEventViaMetaCloud(
  event: CommunityEvent,
  shareMessage: string,
  subscriberPhones: string[],
  config?: MetaCloudConfig | null
): Promise<MetaCloudBroadcastResult> {
  const resolvedConfig = config ?? getMetaCloudConfigFromEnv();
  if (!resolvedConfig) {
    return { success: false, recipientCount: 0 };
  }

  return sendMetaCloudTextBroadcast(resolvedConfig, subscriberPhones, shareMessage);
}
