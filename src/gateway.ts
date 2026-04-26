import { existsSync, readFileSync } from 'fs';

interface WebhookConfig {
  slack?: { url: string; channel?: string };
  discord?: { url: string };
}

interface NotificationPayload {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  metadata?: Record<string, any>;
}

export class Gateway {
  private config: WebhookConfig;

  constructor(configPath: string = '.loom/webhooks.json') {
    if (existsSync(configPath)) {
      try {
        const raw = readFileSync(configPath, 'utf8');
        this.config = JSON.parse(raw);
      } catch {
        this.config = {};
      }
    } else {
      this.config = {};
    }
  }

  async notifySlack(payload: NotificationPayload): Promise<boolean> {
    if (!this.config.slack?.url) {
      return false;
    }

    const colorMap = {
      info: '36B5EB',
      warning: 'FFA500',
      error: 'E74C3C',
      success: '2ECC71'
    };

    const body = {
      channel: this.config.slack.channel,
      attachments: [{
        color: colorMap[payload.type],
        title: payload.title,
        text: payload.message,
        footer: 'LoomMCP',
        ts: Math.floor(Date.now() / 1000),
        fields: payload.metadata ? Object.entries(payload.metadata).map(
          ([key, value]) => ({ title: key, value: String(value), short: true })
        ) : []
      }]
    };

    try {
      const res = await fetch(this.config.slack.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return res.ok;
    } catch (error) {
      console.error('Slack webhook failed:', error);
      return false;
    }
  }

  async notifyDiscord(payload: NotificationPayload): Promise<boolean> {
    if (!this.config.discord?.url) {
      return false;
    }

    const colorMap = {
      info: 3447003,
      warning: 16751360,
      error: 15548997,
      success: 3066993
    };

    const body = {
      embeds: [{
        title: payload.title,
        description: payload.message,
        color: colorMap[payload.type],
        footer: { text: 'LoomMCP' },
        timestamp: new Date().toISOString(),
        fields: payload.metadata ? Object.entries(payload.metadata).map(
          ([key, value]) => ({ name: key, value: String(value), inline: true })
        ) : []
      }]
    };

    try {
      const res = await fetch(this.config.discord.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return res.ok;
    } catch (error) {
      console.error('Discord webhook failed:', error);
      return false;
    }
  }

  async notify(payload: NotificationPayload): Promise<void> {
    await Promise.all([
      this.notifySlack(payload),
      this.notifyDiscord(payload)
    ]);
  }

  setSlackWebhook(url: string, channel?: string): void {
    this.config.slack = { url, channel };
    this.saveConfig();
  }

  setDiscordWebhook(url: string): void {
    this.config.discord = { url };
    this.saveConfig();
  }

  private saveConfig(): void {
    const configDir = '.loom';
    if (!existsSync(configDir)) {
      require('fs').mkdirSync(configDir, { recursive: true });
    }
    require('fs').writeFileSync(
      '.loom/webhooks.json',
      JSON.stringify(this.config, null, 2)
    );
  }

  isConfigured(): { slack: boolean; discord: boolean } {
    return {
      slack: !!this.config.slack?.url,
      discord: !!this.config.discord?.url
    };
  }
}