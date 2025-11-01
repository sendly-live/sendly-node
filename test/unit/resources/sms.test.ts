import { SendlyClient } from "../../../src/client";
import { SMS } from "../../../src/resources/sms";
import fetch from "node-fetch";

// Mock fetch
jest.mock("node-fetch");
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("SMS Resource", () => {
  let client: SendlyClient;
  let sms: SMS;

  beforeEach(() => {
    client = new SendlyClient({
      apiKey: "sl_test_1234567890123456789012345678901234567890",
    });
    sms = client.sms;
  });

  it("should be accessible from client", () => {
    expect(sms).toBeInstanceOf(SMS);
  });

  describe("send method", () => {
    it("should throw ValidationError for missing required fields", async () => {
      await expect(sms.send({} as any)).rejects.toThrow("to is required");
      await expect(sms.send({ to: "+1234567890" } as any)).rejects.toThrow(
        "Either text or mediaUrls must be provided",
      );
    });

    it("should throw ValidationError for invalid phone numbers", async () => {
      await expect(
        sms.send({
          to: "invalid",
          text: "Hello",
        }),
      ).rejects.toThrow("Invalid phone number format for to");

      await expect(
        sms.send({
          to: "+1234567890",
          from: "invalid",
          text: "Hello",
        }),
      ).rejects.toThrow("Invalid phone number format for from");
    });

    it("should throw ValidationError for invalid messageType", async () => {
      await expect(
        sms.send({
          to: "+1234567890",
          text: "Hello",
          messageType: "invalid" as any,
        }),
      ).rejects.toThrow(
        "Invalid messageType. Must be one of: transactional, marketing, otp, alert, promotional",
      );
    });

    it("should validate all messageType options", async () => {
      const validTypes = [
        "transactional",
        "marketing",
        "otp",
        "alert",
        "promotional",
      ];

      // Mock successful response for all valid types
      const mockResponse = {
        id: "msg_test",
        status: "queued",
        from: "+19093180009",
        to: "+14155552671",
        text: "Test message",
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0045,
        direction: "outbound",
        routing: {
          from: "+19093180009",
          type: "long_code",
          reason: "Test routing",
        },
      };

      for (const messageType of validTypes) {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => mockResponse,
        } as any);

        await expect(
          sms.send({
            to: "+14155552671",
            text: "Test message",
            messageType: messageType as any,
          }),
        ).resolves.toBeDefined();
      }
    });
  });

  describe("smart routing", () => {
    it("should auto-route UK numbers to UK sender", async () => {
      const mockResponse = {
        id: "msg_uk_test",
        status: "queued",
        from: "+442038070097",
        to: "+447700900123",
        text: "Hello UK!",
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0045,
        direction: "outbound",
        routing: {
          from: "+442038070097",
          type: "long_code",
          reason: "UK destination - using UK number for better deliverability",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+447700900123",
        text: "Hello UK!",
      });

      expect(result.routing.from).toBe("+442038070097");
      expect(result.routing.type).toBe("long_code");
      expect(result.routing.reason).toContain("UK destination");
    });

    it("should auto-route US transactional messages to toll-free", async () => {
      const mockResponse = {
        id: "msg_us_toll_free",
        status: "queued",
        from: "+18332930104",
        to: "+14155552671",
        text: "Your transaction is complete",
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0045,
        direction: "outbound",
        routing: {
          from: "+18332930104",
          type: "toll_free",
          reason:
            "US/Canada transactional message - using toll-free for maximum throughput (1200/min)",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+14155552671",
        text: "Your transaction is complete",
        messageType: "transactional",
      });

      expect(result.routing.from).toBe("+18332930104");
      expect(result.routing.type).toBe("toll_free");
      expect(result.routing.reason).toContain("transactional message");
    });

    it("should route US marketing messages to toll-free", async () => {
      const mockResponse = {
        id: "msg_us_marketing",
        status: "queued",
        from: "+18332930104",
        to: "+14155552671",
        text: "Special offer just for you!",
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0045,
        direction: "outbound",
        routing: {
          from: "+18332930104",
          type: "toll_free",
          reason:
            "US/Canada marketing message - using toll-free for maximum throughput (1200/min)",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+14155552671",
        text: "Special offer just for you!",
        messageType: "marketing",
      });

      expect(result.routing.from).toBe("+18332930104");
      expect(result.routing.type).toBe("toll_free");
      expect(result.routing.reason).toContain("marketing message");
    });

    it("should route international numbers to US long code", async () => {
      const mockResponse = {
        id: "msg_international",
        status: "queued",
        from: "+19093180009",
        to: "+33123456789",
        text: "Hello France!",
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0045,
        direction: "outbound",
        routing: {
          from: "+19093180009",
          type: "long_code",
          reason:
            "International destination (33) - using US long code for global reach",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+33123456789",
        text: "Hello France!",
      });

      expect(result.routing.from).toBe("+19093180009");
      expect(result.routing.type).toBe("long_code");
      expect(result.routing.reason).toContain("International destination");
    });

    it("should throw error when toll-free tries to send internationally", async () => {
      await expect(
        sms.send({
          to: "+33123456789",
          from: "+18332930104",
          text: "Hello France!",
        }),
      ).rejects.toThrow(
        "Toll-free number +18332930104 cannot send to international destination +33123456789",
      );
    });

    it("should route OTP messages to toll-free for highest priority", async () => {
      const mockResponse = {
        id: "msg_otp",
        status: "queued",
        from: "+18332930104",
        to: "+14155552671",
        text: "Your verification code is 123456",
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0045,
        direction: "outbound",
        routing: {
          from: "+18332930104",
          type: "toll_free",
          reason:
            "OTP message - using toll-free for maximum speed and deliverability",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+14155552671",
        text: "Your verification code is 123456",
        messageType: "otp",
      });

      expect(result.routing.from).toBe("+18332930104");
      expect(result.routing.type).toBe("toll_free");
      expect(result.routing.reason).toContain("OTP message");
    });
  });

  describe("country code detection", () => {
    it("should detect various country codes correctly", () => {
      const smsInstance = new SMS({} as any);

      // Access private method for testing via any cast
      const getCountryCode = (smsInstance as any).getCountryCode.bind(
        smsInstance,
      );

      expect(getCountryCode("+14155552671")).toBe("1"); // US
      expect(getCountryCode("+447700900123")).toBe("44"); // UK
      expect(getCountryCode("+33123456789")).toBe("33"); // France
      expect(getCountryCode("+27123456789")).toBe("27"); // South Africa
      expect(getCountryCode("+999999999999")).toBe("unknown"); // Unknown
    });
  });

  describe("toll-free detection", () => {
    it("should correctly identify toll-free numbers", () => {
      const smsInstance = new SMS({} as any);

      // Access private method for testing via any cast
      const isTollFree = (smsInstance as any).isTollFree.bind(smsInstance);

      expect(isTollFree("+18001234567")).toBe(true); // 800
      expect(isTollFree("+18332930104")).toBe(true); // 833
      expect(isTollFree("+19093180009")).toBe(false); // Regular US number
      expect(isTollFree("+442038070097")).toBe(false); // UK number
    });
  });

  describe("successful sending", () => {
    beforeEach(() => {
      mockFetch.mockClear();
    });

    it("should send SMS successfully with explicit from field", async () => {
      const mockResponse = {
        id: "msg_2n0g2Q3K4F5G6H7J8K9L0M",
        status: "queued",
        from: "+19093180009",
        to: "+14155552671",
        text: "Hello from Sendly!",
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0045,
        direction: "outbound",
        routing: {
          from: "+19093180009",
          type: "long_code",
          reason: "User-specified long code number",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+14155552671",
        from: "+19093180009",
        text: "Hello from Sendly!",
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.sendly.live/v1/send",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer sl_test_1234567890123456789012345678901234567890",
            "Content-Type": "application/json",
            "User-Agent": "@sendly/node@0.1.0",
          },
          body: JSON.stringify({
            to: "+14155552671",
            messageType: "transactional",
            from: "+19093180009",
            text: "Hello from Sendly!",
          }),
        },
      );
    });
  });

  describe("MMS support", () => {
    beforeEach(() => {
      mockFetch.mockClear();
    });

    it("should throw ValidationError for invalid mediaUrls format", async () => {
      await expect(
        sms.send({
          to: "+14155552671",
          text: "Check out this image!",
          mediaUrls: ["not-a-valid-url", "also-invalid"],
        }),
      ).rejects.toThrow("Invalid URL format in mediaUrls");

      await expect(
        sms.send({
          to: "+14155552671",
          text: "Check out this image!",
          mediaUrls: ["http://example.com/image.jpg"], // HTTP not HTTPS
        }),
      ).rejects.toThrow("Media URLs must use HTTPS");
    });

    it("should throw ValidationError for too many media URLs", async () => {
      const tooManyUrls = Array(11).fill("https://example.com/image.jpg");

      await expect(
        sms.send({
          to: "+14155552671",
          text: "Too many images!",
          mediaUrls: tooManyUrls,
        }),
      ).rejects.toThrow("Maximum 10 media URLs allowed");
    });

    it("should send MMS successfully with single media URL", async () => {
      const mockResponse = {
        id: "msg_mms_single",
        status: "queued",
        from: "+18332930104",
        to: "+14155552671",
        text: "Check out this image!",
        mediaUrls: ["https://example.com/image.jpg"],
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0075,
        direction: "outbound",
        routing: {
          from: "+18332930104",
          type: "toll_free",
          reason: "MMS message - using toll-free for optimal delivery",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+14155552671",
        text: "Check out this image!",
        mediaUrls: ["https://example.com/image.jpg"],
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.sendly.live/v1/send",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer sl_test_1234567890123456789012345678901234567890",
            "Content-Type": "application/json",
            "User-Agent": "@sendly/node@0.1.0",
          },
          body: JSON.stringify({
            to: "+14155552671",
            messageType: "transactional",
            text: "Check out this image!",
            mediaUrls: ["https://example.com/image.jpg"],
          }),
        },
      );
    });

    it("should send MMS successfully with multiple media URLs and subject", async () => {
      const mockResponse = {
        id: "msg_mms_multiple",
        status: "queued",
        from: "+18332930104",
        to: "+14155552671",
        text: "Check out these photos from our trip!",
        subject: "Trip Photos",
        mediaUrls: [
          "https://example.com/photo1.jpg",
          "https://example.com/photo2.png",
          "https://example.com/video.mp4",
        ],
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0125,
        direction: "outbound",
        routing: {
          from: "+18332930104",
          type: "toll_free",
          reason: "MMS message with multiple media - using toll-free",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+14155552671",
        text: "Check out these photos from our trip!",
        subject: "Trip Photos",
        mediaUrls: [
          "https://example.com/photo1.jpg",
          "https://example.com/photo2.png",
          "https://example.com/video.mp4",
        ],
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.sendly.live/v1/send",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer sl_test_1234567890123456789012345678901234567890",
            "Content-Type": "application/json",
            "User-Agent": "@sendly/node@0.1.0",
          },
          body: JSON.stringify({
            to: "+14155552671",
            messageType: "transactional",
            text: "Check out these photos from our trip!",
            mediaUrls: [
              "https://example.com/photo1.jpg",
              "https://example.com/photo2.png",
              "https://example.com/video.mp4",
            ],
            subject: "Trip Photos",
          }),
        },
      );
    });

    it("should allow MMS without text content", async () => {
      const mockResponse = {
        id: "msg_mms_no_text",
        status: "queued",
        from: "+18332930104",
        to: "+14155552671",
        text: null,
        subject: "Photo Only",
        mediaUrls: ["https://example.com/image.jpg"],
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0075,
        direction: "outbound",
        routing: {
          from: "+18332930104",
          type: "toll_free",
          reason: "MMS-only message",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+14155552671",
        subject: "Photo Only",
        mediaUrls: ["https://example.com/image.jpg"],
      });

      expect(result).toEqual(mockResponse);
    });

    it("should throw ValidationError when neither text nor mediaUrls provided", async () => {
      await expect(
        sms.send({
          to: "+14155552671",
          subject: "Empty message",
        }),
      ).rejects.toThrow("Either text or mediaUrls must be provided");
    });
  });

  describe("webhook and tags support", () => {
    beforeEach(() => {
      mockFetch.mockClear();
    });

    it("should throw ValidationError for invalid webhook URLs", async () => {
      await expect(
        sms.send({
          to: "+14155552671",
          text: "Hello with webhook",
          webhookUrl: "not-a-valid-url",
        }),
      ).rejects.toThrow("Invalid webhook URL format");

      await expect(
        sms.send({
          to: "+14155552671",
          text: "Hello with webhook",
          webhookUrl: "http://example.com/webhook", // HTTP not HTTPS
        }),
      ).rejects.toThrow("Webhook URL must use HTTPS");

      await expect(
        sms.send({
          to: "+14155552671",
          text: "Hello with webhook",
          webhookFailoverUrl: "invalid-failover-url",
        }),
      ).rejects.toThrow("Invalid webhook failover URL format");
    });

    it("should throw ValidationError for invalid tags", async () => {
      await expect(
        sms.send({
          to: "+14155552671",
          text: "Hello with tags",
          tags: ["valid-tag", ""], // Empty tag
        }),
      ).rejects.toThrow("Tags cannot be empty");

      await expect(
        sms.send({
          to: "+14155552671",
          text: "Hello with tags",
          tags: [
            "tag",
            "another-tag",
            "way-too-long-tag-that-exceeds-the-maximum-length-limit-for-tags-which-should-be-reasonable",
          ],
        }),
      ).rejects.toThrow("Tag length cannot exceed 50 characters");

      const tooManyTags = Array(21).fill("tag");
      await expect(
        sms.send({
          to: "+14155552671",
          text: "Hello with tags",
          tags: tooManyTags,
        }),
      ).rejects.toThrow("Maximum 20 tags allowed");
    });

    it("should send SMS successfully with webhook URL", async () => {
      const mockResponse = {
        id: "msg_webhook_test",
        status: "queued",
        from: "+18332930104",
        to: "+14155552671",
        text: "Hello with webhook",
        webhookUrl: "https://example.com/webhook",
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0045,
        direction: "outbound",
        routing: {
          from: "+18332930104",
          type: "toll_free",
          reason: "Transactional message with webhook",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+14155552671",
        text: "Hello with webhook",
        webhookUrl: "https://example.com/webhook",
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.sendly.live/v1/send",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer sl_test_1234567890123456789012345678901234567890",
            "Content-Type": "application/json",
            "User-Agent": "@sendly/node@0.1.0",
          },
          body: JSON.stringify({
            to: "+14155552671",
            messageType: "transactional",
            text: "Hello with webhook",
            webhookUrl: "https://example.com/webhook",
          }),
        },
      );
    });

    it("should send SMS successfully with webhook URL and failover", async () => {
      const mockResponse = {
        id: "msg_webhook_failover",
        status: "queued",
        from: "+18332930104",
        to: "+14155552671",
        text: "Hello with webhook and failover",
        webhookUrl: "https://primary.example.com/webhook",
        webhookFailoverUrl: "https://backup.example.com/webhook",
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0045,
        direction: "outbound",
        routing: {
          from: "+18332930104",
          type: "toll_free",
          reason: "Transactional message with webhook failover",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+14155552671",
        text: "Hello with webhook and failover",
        webhookUrl: "https://primary.example.com/webhook",
        webhookFailoverUrl: "https://backup.example.com/webhook",
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.sendly.live/v1/send",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer sl_test_1234567890123456789012345678901234567890",
            "Content-Type": "application/json",
            "User-Agent": "@sendly/node@0.1.0",
          },
          body: JSON.stringify({
            to: "+14155552671",
            messageType: "transactional",
            text: "Hello with webhook and failover",
            webhookUrl: "https://primary.example.com/webhook",
            webhookFailoverUrl: "https://backup.example.com/webhook",
          }),
        },
      );
    });

    it("should send SMS successfully with tags", async () => {
      const mockResponse = {
        id: "msg_tags_test",
        status: "queued",
        from: "+18332930104",
        to: "+14155552671",
        text: "Hello with tags",
        tags: ["marketing", "summer-campaign", "user-123"],
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0045,
        direction: "outbound",
        routing: {
          from: "+18332930104",
          type: "toll_free",
          reason: "Tagged message for campaign tracking",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+14155552671",
        text: "Hello with tags",
        tags: ["marketing", "summer-campaign", "user-123"],
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.sendly.live/v1/send",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer sl_test_1234567890123456789012345678901234567890",
            "Content-Type": "application/json",
            "User-Agent": "@sendly/node@0.1.0",
          },
          body: JSON.stringify({
            to: "+14155552671",
            messageType: "transactional",
            text: "Hello with tags",
            tags: ["marketing", "summer-campaign", "user-123"],
          }),
        },
      );
    });

    it("should send MMS successfully with all advanced features", async () => {
      const mockResponse = {
        id: "msg_full_featured",
        status: "queued",
        from: "+18332930104",
        to: "+14155552671",
        text: "Complete feature test",
        subject: "Advanced MMS",
        mediaUrls: ["https://example.com/image.jpg"],
        webhookUrl: "https://example.com/webhook",
        webhookFailoverUrl: "https://backup.example.com/webhook",
        tags: ["test", "full-features"],
        created_at: "2024-01-27T10:30:00Z",
        segments: 1,
        cost: 0.0075,
        direction: "outbound",
        routing: {
          from: "+18332930104",
          type: "toll_free",
          reason: "Full-featured MMS with tracking",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await sms.send({
        to: "+14155552671",
        text: "Complete feature test",
        subject: "Advanced MMS",
        mediaUrls: ["https://example.com/image.jpg"],
        webhookUrl: "https://example.com/webhook",
        webhookFailoverUrl: "https://backup.example.com/webhook",
        tags: ["test", "full-features"],
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.sendly.live/v1/send",
        {
          method: "POST",
          headers: {
            Authorization:
              "Bearer sl_test_1234567890123456789012345678901234567890",
            "Content-Type": "application/json",
            "User-Agent": "@sendly/node@0.1.0",
          },
          body: JSON.stringify({
            to: "+14155552671",
            messageType: "transactional",
            text: "Complete feature test",
            mediaUrls: ["https://example.com/image.jpg"],
            subject: "Advanced MMS",
            webhookUrl: "https://example.com/webhook",
            webhookFailoverUrl: "https://backup.example.com/webhook",
            tags: ["test", "full-features"],
          }),
        },
      );
    });
  });
});
