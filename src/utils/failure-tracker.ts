export class FailureTracker {
    private totalRequests: number;
    private failedRequests: number;
    private failoverActive: boolean;
    private failoverStartTime: number | null;
    private readonly FAILURE_THRESHOLD: number;
    private readonly FAILOVER_DURATION_MS: number;

    constructor(failureThreshold = 0.5, failoverDurationMs = 5 * 60 * 1000) {
        this.totalRequests = 0;
        this.failedRequests = 0;
        this.failoverActive = false;
        this.failoverStartTime = null;
        this.FAILURE_THRESHOLD = failureThreshold;
        this.FAILOVER_DURATION_MS = failoverDurationMs;
    }

    /**
     * Tracks a request's success or failure.
     * @param success Whether the request was successful
     */
    trackRequest(success: boolean) {
        this.totalRequests++;

        if (!success) {
            this.failedRequests++;
        }

        if (this.shouldFailover() && !this.failoverActive) {
            this.failoverActive = true;
            this.failoverStartTime = Date.now();
            console.warn("Failover activated! Using Premium Car Valuations.");
        }
    }

    /**
     * Determines if the service should failover.
     * @returns boolean
     */
    shouldFailover(): boolean {
        if (this.failoverActive) {
            const elapsed = Date.now() - (this.failoverStartTime || 0);
            if (elapsed > this.FAILOVER_DURATION_MS) {
                console.info("Failover period expired. Resetting failure tracker.");
                this.resetFailureTracker();
                return false;
            }
            return true;
        }

        return this.totalRequests > 0 &&
            this.failedRequests / this.totalRequests > this.FAILURE_THRESHOLD;
    }

    /**
     * Resets the failure tracker stats (used after failover expiration).
     */
    resetFailureTracker() {
        this.totalRequests = 0;
        this.failedRequests = 0;
        this.failoverActive = false;
        this.failoverStartTime = null;
    }
}
