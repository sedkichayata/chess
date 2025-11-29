import { describe, it, expect } from "vitest";
import { getTierPrice, makeAbsolute } from "./stripe-helpers.js";

describe("Stripe Helpers", () => {
  describe("getTierPrice", () => {
    it("returns correct price for starter", () => {
      expect(getTierPrice("starter")).toEqual({
        name: "Starter Plan",
        cents: 999,
      });
    });

    it("returns correct price for pro", () => {
      expect(getTierPrice("pro")).toEqual({ name: "Pro Plan", cents: 1999 });
    });

    it("returns correct price for elite", () => {
      expect(getTierPrice("elite")).toEqual({
        name: "Elite Plan",
        cents: 2999,
      });
    });

    it("defaults to starter for unknown tier", () => {
      expect(getTierPrice("unknown")).toEqual({
        name: "Starter Plan",
        cents: 999,
      });
    });
  });

  describe("makeAbsolute", () => {
    it("returns original url if already absolute", () => {
      expect(makeAbsolute("https://example.com", "http://base.com")).toBe(
        "https://example.com",
      );
    });

    it("prepends base url if relative", () => {
      expect(makeAbsolute("/path", "http://base.com")).toBe(
        "http://base.com/path",
      );
    });

    it("handles missing leading slash", () => {
      expect(makeAbsolute("path", "http://base.com")).toBe(
        "http://base.com/path",
      );
    });
  });
});
