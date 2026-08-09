import * as Linking from 'expo-linking';
import { CommunityEvent } from '../../domain/models/Event';

export class WhatsAppService {
  buildShareMessage(event: CommunityEvent): string {
    const webLink = `https://community.yourdomain.com/e/${event.id}`;
    let categoryHeader = '';

    if (event.category === 'MARRIAGE') {
      categoryHeader = `💍 *WEDDING INVITATION* 💍\n\nCelebrate the wedding of *${event.groomName || 'Groom'}* & *${event.brideName || 'Bride'}*!`;
    } else if (event.category === 'CULTURAL') {
      categoryHeader = `🎉 *COMMUNITY CULTURAL EVENT* 🎉\n\n*${event.title}*`;
    } else {
      categoryHeader = `📋 *COMMUNITY MEETING NOTICE* 📋\n\n*${event.title}*`;
    }

    return `${categoryHeader}

📅 *Date:* ${event.date}
⏰ *Time:* ${event.time}
📍 *Venue:* ${event.venue}

📝 *Details:*
${event.details}

${event.googleMapsUrl ? `🗺️ *Google Maps:* ${event.googleMapsUrl}\n` : ''}
🔗 *RSVP & Invitation Card:* ${webLink}

_Sent via Community Connect App_`;
  }

  async shareEventToWhatsApp(event: CommunityEvent): Promise<boolean> {
    const text = this.buildShareMessage(event);
    const encodedText = encodeURIComponent(text);
    const nativeWhatsappUrl = `whatsapp://send?text=${encodedText}`;
    const webWhatsappUrl = `https://wa.me/?text=${encodedText}`;

    try {
      const canOpenNative = await Linking.canOpenURL(nativeWhatsappUrl);
      if (canOpenNative) {
        await Linking.openURL(nativeWhatsappUrl);
        return true;
      } else {
        await Linking.openURL(webWhatsappUrl);
        return true;
      }
    } catch (e) {
      console.warn('[WhatsAppService] Deep link fallback to web:', e);
      await Linking.openURL(webWhatsappUrl);
      return true;
    }
  }

  async triggerMetaCloudBroadcast(event: CommunityEvent): Promise<{ success: boolean; recipientCount: number }> {
    // Simulated call to Meta WhatsApp Cloud API endpoint (v18.0)
    await new Promise((resolve) => setTimeout(resolve, 800));
    console.log(`[Meta Cloud API] Broadcasted event ${event.id} to registered WhatsApp community groups.`);
    return { success: true, recipientCount: 342 };
  }
}

export const whatsappService = new WhatsAppService();
