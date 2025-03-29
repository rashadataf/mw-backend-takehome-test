import { describe, beforeEach, it, expect, vi } from "vitest";
import { FailureTracker } from "@app/utils/failure-tracker";

describe("FailureTracker", () => {
    let failureTracker: FailureTracker;

    beforeEach(() => {
        failureTracker = new FailureTracker(0.7); // 70% failure threshold
        vi.clearAllMocks();
    });

    it("should not activate failover if failures are below threshold", () => {
        failureTracker.trackRequest(true);  // success
        failureTracker.trackRequest(false); // 1 failure out of 2 (50%)
        expect(failureTracker.shouldFailover()).toBe(false);

        failureTracker.trackRequest(true);
        failureTracker.trackRequest(true);
        failureTracker.trackRequest(true); // 1 failure out of 5 (20%)
        expect(failureTracker.shouldFailover()).toBe(false);
    });

    it("should activate failover when failure rate exceeds 10%", () => {
        for (let i = 0; i < 10; i++) {
            failureTracker.trackRequest(i < 2); // First 2 succeed, next 8 fail (80% fail)
        }
        expect(failureTracker.shouldFailover()).toBe(true);
    });

    it("should keep failover active once triggered", () => {
        for (let i = 0; i < 10; i++) {
            failureTracker.trackRequest(false); // 10 failures
        }
        expect(failureTracker.shouldFailover()).toBe(true);

        // Even after 5 successful requests, failover remains active
        for (let i = 0; i < 5; i++) {
            failureTracker.trackRequest(true);
        }
        expect(failureTracker.shouldFailover()).toBe(true);
    });

    it("should reset after failover duration expires", () => {
        failureTracker.trackRequest(false); // Fail
        vi.setSystemTime(Date.now() + 6 * 60 * 1000); // Advance time by 6 minutes
        expect(failureTracker.shouldFailover()).toBe(false);
    });

    it("should reset the failure tracker when reset is called", () => {
        for (let i = 0; i < 10; i++) {
            failureTracker.trackRequest(false);
        }
        expect(failureTracker.shouldFailover()).toBe(true);

        failureTracker.resetFailureTracker();
        expect(failureTracker.shouldFailover()).toBe(false);
    });
});
