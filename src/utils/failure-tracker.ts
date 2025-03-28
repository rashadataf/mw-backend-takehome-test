const FAILURE_THRESHOLD = 0.5; // 50% failure rate
const FAILOVER_DURATION_MS = 5 * 60 * 1000; // 5 minutes

let totalRequests = 0;
let failedRequests = 0;
let failoverActive = false;
let failoverStartTime: number | null = null;

/**
 * Track a request's success or failure.
 * @param success Whether the request was successful
 */
export function trackRequest(success: boolean) {
    totalRequests++;

    if (!success) {
        failedRequests++;
    }

    if (shouldFailover() && !failoverActive) {
        failoverActive = true;
        failoverStartTime = Date.now();
        console.warn("Failover activated! Using Premium Car Valuations.");
    }
}

/**
 * Check if the service should failover to the premium provider.
 * @returns boolean
 */
export function shouldFailover(): boolean {
    if (failoverActive) {
        const elapsed = Date.now() - (failoverStartTime || 0);
        if (elapsed > FAILOVER_DURATION_MS) {
            console.info("Failover period expired. Resetting failure tracker.");
            resetFailureTracker();
            return false;
        }
        return true;
    }

    return totalRequests > 0 && failedRequests / totalRequests > FAILURE_THRESHOLD;
}

/**
 * Resets the failure tracker stats (used after failover expiration).
 */
export function resetFailureTracker() {
    totalRequests = 0;
    failedRequests = 0;
    failoverActive = false;
    failoverStartTime = null;
}
