package com.fitempire.modules.ecosystem.controller;

import com.fitempire.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/v1/ecosystem")
@RequiredArgsConstructor
@Tag(name = "Ecosystem", description = "FitEmpire ecosystem modules: Activities, Nutrition, Store, Care, TV, Corporate")
public class EcosystemController {

    // ── 1. Activities Catalog ──────────────────────────────────────────────
    @GetMapping("/activities")
    @Operation(summary = "Get all 15+ fitness & sports activities")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getActivities() {
        List<Map<String, Object>> list = Arrays.asList(
                Map.of("id", "1", "name", "Gym Workouts", "category", "STRENGTH", "color", "#E75A5D", "duration",
                        "60-90 min", "image", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500"),
                Map.of("id", "2", "name", "Badminton", "category", "SPORTS", "color", "#0D9488", "duration",
                        "45-60 min", "image", "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500"),
                Map.of("id", "3", "name", "Swimming", "category", "AQUATICS", "color", "#3B82F6", "duration",
                        "45-60 min", "image", "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=500"),
                Map.of("id", "4", "name", "MMA & Combat", "category", "MARTIAL_ARTS", "color", "#DC2626", "duration",
                        "60 min", "image", "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=500"),
                Map.of("id", "5", "name", "Yoga & Meditation", "category", "WELLNESS", "color", "#7C3AED", "duration",
                        "45-60 min", "image", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500"),
                Map.of("id", "6", "name", "CrossFit Rig", "category", "STRENGTH", "color", "#D97706", "duration",
                        "45 min", "image", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500"),
                Map.of("id", "7", "name", "Football Turf", "category", "SPORTS", "color", "#10B981", "duration",
                        "60-90 min", "image", "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500"),
                Map.of("id", "8", "name", "Boxing & Sparring", "category", "MARTIAL_ARTS", "color", "#EF4444",
                        "duration", "60 min", "image",
                        "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=500"),
                Map.of("id", "9", "name", "Zumba & Dance", "category", "CARDIO", "color", "#DB2777", "duration",
                        "45 min", "image", "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500"),
                Map.of("id", "10", "name", "Pickleball", "category", "SPORTS", "color", "#F59E0B", "duration",
                        "45-60 min", "image", "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500"),
                Map.of("id", "11", "name", "Table Tennis", "category", "SPORTS", "color", "#06B6D4", "duration",
                        "30-60 min", "image", "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=500"),
                Map.of("id", "12", "name", "Snooker & Pool", "category", "SPORTS", "color", "#8B5CF6", "duration",
                        "60-120 min", "image", "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500"));
        return ResponseEntity.ok(ApiResponse.success("Activities retrieved successfully", list));
    }

    // ── 2. Nutrition / Food Library ─────────────────────────────────────────
    @GetMapping("/foods")
    @Operation(summary = "Get nutrition and food library with macros")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFoods() {
        List<Map<String, Object>> foods = Arrays.asList(
                Map.of("id", "1", "name", "Chicken Breast (Grilled)", "calories", 165, "protein", 31.0, "carbs", 0.0,
                        "fats", 3.6, "serving", "100g cooked"),
                Map.of("id", "2", "name", "Boiled Eggs (Whole)", "calories", 155, "protein", 13.0, "carbs", 1.1, "fats",
                        11.0, "serving", "2 large eggs (100g)"),
                Map.of("id", "3", "name", "Whey Protein Isolate", "calories", 120, "protein", 25.0, "carbs", 2.0,
                        "fats", 1.0, "serving", "1 scoop (30g)"),
                Map.of("id", "4", "name", "Paneer / Cottage Cheese", "calories", 265, "protein", 18.0, "carbs", 3.0,
                        "fats", 20.0, "serving", "100g"),
                Map.of("id", "5", "name", "Tofu (Firm / Organic)", "calories", 144, "protein", 17.0, "carbs", 3.0,
                        "fats", 8.0, "serving", "100g"),
                Map.of("id", "6", "name", "Rolled Oats (Dry)", "calories", 389, "protein", 16.9, "carbs", 66.3, "fats",
                        6.9, "serving", "1 cup (100g)"),
                Map.of("id", "7", "name", "Brown Rice (Cooked)", "calories", 218, "protein", 4.5, "carbs", 45.8, "fats",
                        1.6, "serving", "1 cup (195g)"),
                Map.of("id", "8", "name", "Greek Yogurt (Plain 0%)", "calories", 97, "protein", 10.0, "carbs", 3.6,
                        "fats", 0.4, "serving", "1 cup (170g)"),
                Map.of("id", "9", "name", "Peanut Butter (Natural)", "calories", 190, "protein", 8.0, "carbs", 7.0,
                        "fats", 16.0, "serving", "2 tbsp (32g)"),
                Map.of("id", "10", "name", "Atlantic Salmon (Fillet)", "calories", 208, "protein", 22.0, "carbs", 0.0,
                        "fats", 13.0, "serving", "100g fillet"));
        return ResponseEntity.ok(ApiResponse.success("Food database retrieved successfully", foods));
    }

    // ── 3. Store Products & Inventory Management (FE-145, FE-152) ──────────
    private static final Map<String, Integer> PRODUCT_STOCK = new ConcurrentHashMap<>();
    static {
        PRODUCT_STOCK.put("p1", 25);
        PRODUCT_STOCK.put("p2", 40);
        PRODUCT_STOCK.put("p3", 15);
        PRODUCT_STOCK.put("p4", 30);
        PRODUCT_STOCK.put("p5", 50);
    }

    @GetMapping("/store/products")
    @Operation(summary = "Get fitness equipment & supplements store items with live stock counts")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getStoreProducts() {
        List<Map<String, Object>> products = Arrays.asList(
                Map.of("id", "p1", "name", "QuickShift Pro Adjustable Dumbbell (2.5kg - 24kg)", "category", "EQUIPMENT",
                        "price", 8999, "oldPrice", 14999, "rating", 4.9, "reviews", 142, "stockCount", PRODUCT_STOCK.getOrDefault("p1", 0),
                        "inStock", PRODUCT_STOCK.getOrDefault("p1", 0) > 0, "image",
                        "https://images.unsplash.com/photo-1586401100295-7a8096fd231a?w=500"),
                Map.of("id", "p2", "name", "Origami Foldable Anti-Tear Yoga Mat (6mm)", "category", "GEAR", "price",
                        2199, "oldPrice", 3499, "rating", 4.8, "reviews", 89, "stockCount", PRODUCT_STOCK.getOrDefault("p2", 0),
                        "inStock", PRODUCT_STOCK.getOrDefault("p2", 0) > 0, "image",
                        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500"),
                Map.of("id", "p3", "name", "Empire Pro 100% Whey Isolate (2kg Double Chocolate)", "category",
                        "NUTRITION", "price", 4499, "oldPrice", 6299, "rating", 4.9, "reviews", 320, "stockCount", PRODUCT_STOCK.getOrDefault("p3", 0),
                        "inStock", PRODUCT_STOCK.getOrDefault("p3", 0) > 0, "image",
                        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500"),
                Map.of("id", "p4", "name", "Heavy Duty Lever Lifting Belt (10mm Genuine Leather)", "category", "GEAR",
                        "price", 3499, "oldPrice", 5999, "rating", 4.9, "reviews", 76, "stockCount", PRODUCT_STOCK.getOrDefault("p4", 0),
                        "inStock", PRODUCT_STOCK.getOrDefault("p4", 0) > 0, "image",
                        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500"),
                Map.of("id", "p5", "name", "Micronized Creatine Monohydrate (250g / 83 Servings)", "category",
                        "NUTRITION", "price", 899, "oldPrice", 1499, "rating", 4.8, "reviews", 215, "stockCount", PRODUCT_STOCK.getOrDefault("p5", 0),
                        "inStock", PRODUCT_STOCK.getOrDefault("p5", 0) > 0, "image",
                        "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500"));
        return ResponseEntity.ok(ApiResponse.success("Store products retrieved successfully", products));
    }

    @PostMapping("/store/order")
    @Operation(summary = "Process store order and atomically decrement product inventory stock")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processStoreOrder(@RequestBody Map<String, Object> orderRequest) {
        String productId = (String) orderRequest.getOrDefault("productId", "");
        int quantity = ((Number) orderRequest.getOrDefault("quantity", 1)).intValue();

        if (!PRODUCT_STOCK.containsKey(productId)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid product ID: " + productId, "INVALID_PRODUCT"));
        }

        synchronized (PRODUCT_STOCK) {
            int currentStock = PRODUCT_STOCK.get(productId);
            if (currentStock < quantity) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Insufficient stock. Only " + currentStock + " units available.", "INSUFFICIENT_STOCK"));
            }
            int updatedStock = currentStock - quantity;
            PRODUCT_STOCK.put(productId, updatedStock);

            Map<String, Object> result = new LinkedHashMap<>();
            result.put("orderId", "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            result.put("productId", productId);
            result.put("quantity", quantity);
            result.put("remainingStock", updatedStock);
            result.put("status", "CONFIRMED");
            result.put("message", "Order placed successfully. Inventory updated.");
            return ResponseEntity.ok(ApiResponse.success("Store order processed", result));
        }
    }

    // ── 4. Doctor Consultations & Care (FE-148) ──────────────────────────────
    @GetMapping("/care/doctors")
    @Operation(summary = "Get available telehealth doctors with real-time slot availability")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDoctors() {
        String todaySlot = "Today, 04:30 PM";
        String tomorrowSlot = "Tomorrow, 11:00 AM";
        List<Map<String, Object>> doctors = Arrays.asList(
                Map.of("id", "d1", "name", "Dr. Ananya Sen", "specialty", "Chief Sports Nutritionist & Dietitian",
                        "experience", "9+ Years Exp", "rating", 4.9, "available", true, "image",
                        "https://images.unsplash.com/photo-1594824813576-06835260195e?w=400", "nextSlot",
                        todaySlot, "fee", "FREE with FitEmpire Pro"),
                Map.of("id", "d2", "name", "Dr. Rajesh Nair", "specialty", "Sports Physiotherapist & Rehab",
                        "experience", "12+ Years Exp", "rating", 4.9, "available", true, "image",
                        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400", "nextSlot",
                        tomorrowSlot, "fee", "FREE with FitEmpire Pro"),
                Map.of("id", "d3", "name", "Dr. Meera Kapoor", "specialty", "General Physician & Wellness",
                        "experience", "8+ Years Exp", "rating", 4.8, "available", true, "image",
                        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400", "nextSlot",
                        "Today, 06:00 PM", "fee", "FREE with FitEmpire Pro"));
        return ResponseEntity.ok(ApiResponse.success("Care doctors retrieved successfully", doctors));
    }

    // Concurrent appointment tracking for slot locking and cancellation notice enforcement (FE-173, FE-175)
    private static final Map<String, Map<String, Object>> BOOKED_APPOINTMENTS = new ConcurrentHashMap<>();

    @PostMapping("/care/appointments/book")
    @Operation(summary = "Book telehealth doctor appointment with concurrency locking (FE-173)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> bookDoctorAppointment(@RequestBody Map<String, String> bookingRequest) {
        String doctorId = bookingRequest.getOrDefault("doctorId", "");
        String slot = bookingRequest.getOrDefault("slot", "");
        String patientName = bookingRequest.getOrDefault("patientName", "User");
        String patientEmail = bookingRequest.getOrDefault("patientEmail", "");

        if (doctorId.isBlank() || slot.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Doctor ID and appointment slot are required.", "INVALID_REQUEST"));
        }

        String slotKey = doctorId + ":" + slot;
        synchronized (BOOKED_APPOINTMENTS) {
            if (BOOKED_APPOINTMENTS.containsKey(slotKey)) {
                return ResponseEntity.status(409).body(ApiResponse.error("This doctor slot (" + slot + ") is already booked by another patient. Please choose another time.", "SLOT_ALREADY_BOOKED"));
            }

            Map<String, Object> appointment = new LinkedHashMap<>();
            String appointmentId = "APT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            appointment.put("appointmentId", appointmentId);
            appointment.put("doctorId", doctorId);
            appointment.put("slot", slot);
            appointment.put("scheduledTime", Instant.now().plus(Duration.ofHours(24)).toString());
            appointment.put("patientName", patientName);
            appointment.put("patientEmail", patientEmail);
            appointment.put("status", "CONFIRMED");

            BOOKED_APPOINTMENTS.put(slotKey, appointment);
            return ResponseEntity.ok(ApiResponse.success("Doctor appointment booked successfully", appointment));
        }
    }

    @PostMapping("/care/appointments/cancel")
    @Operation(summary = "Cancel doctor appointment with 12-hour minimum notice window policy (FE-175)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cancelDoctorAppointment(@RequestBody Map<String, String> cancelRequest) {
        String appointmentId = cancelRequest.getOrDefault("appointmentId", "");
        if (appointmentId.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Appointment ID is required.", "INVALID_REQUEST"));
        }

        synchronized (BOOKED_APPOINTMENTS) {
            Map.Entry<String, Map<String, Object>> targetEntry = null;
            for (Map.Entry<String, Map<String, Object>> entry : BOOKED_APPOINTMENTS.entrySet()) {
                if (appointmentId.equals(entry.getValue().get("appointmentId"))) {
                    targetEntry = entry;
                    break;
                }
            }

            if (targetEntry == null) {
                return ResponseEntity.status(404).body(ApiResponse.error("Appointment not found: " + appointmentId, "APPOINTMENT_NOT_FOUND"));
            }

            String scheduledTimeStr = (String) targetEntry.getValue().get("scheduledTime");
            Instant scheduledTime = Instant.parse(scheduledTimeStr);
            long hoursUntilAppointment = Duration.between(Instant.now(), scheduledTime).toHours();

            if (hoursUntilAppointment < 12) {
                return ResponseEntity.badRequest().body(ApiResponse.error(
                        "Cancellations must be made at least 12 hours before the scheduled appointment. Time remaining: " + hoursUntilAppointment + " hours.",
                        "CANCELLATION_POLICY_VIOLATION"));
            }

            BOOKED_APPOINTMENTS.remove(targetEntry.getKey());
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("appointmentId", appointmentId);
            result.put("status", "CANCELLED");
            result.put("message", "Appointment cancelled successfully with full policy compliance.");
            return ResponseEntity.ok(ApiResponse.success("Appointment cancelled", result));
        }
    }

    // ── 5. Video Workouts (TV) ──────────────────────────────────────────────
    @GetMapping("/tv/videos")
    @Operation(summary = "Get on-demand HD video workout classes")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVideos() {
        List<Map<String, Object>> videos = Arrays.asList(
                Map.of("id", "tv1", "title", "30-Min High-Intensity FightCamp & Combat HIIT", "trainer",
                        "Coach Vikram (MMA Fighter)", "duration", "30 Mins", "calories", "420 kcal", "level",
                        "Advanced", "image", "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600",
                        "viewers", "2.4k Active"),
                Map.of("id", "tv2", "title", "25-Min Fat Burning Cardio & Core Shred", "trainer",
                        "Sarah Chen (Pro Athlete)", "duration", "25 Mins", "calories", "310 kcal", "level",
                        "Intermediate", "image", "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600",
                        "viewers", "1.8k Active"),
                Map.of("id", "tv3", "title", "Power Vinyasa Flow & Deep Mobility Release", "trainer",
                        "Aanya Sharma (Yoga Master)", "duration", "40 Mins", "calories", "220 kcal", "level",
                        "All Levels", "image", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600",
                        "viewers", "3.1k Active"));
        return ResponseEntity.ok(ApiResponse.success("Video classes retrieved successfully", videos));
    }

    // ── 6. Corporate Email Verification & Quota/Time-Limit Enforcement (FE-141, FE-144) ───

    public static class EnrolledEmployee {
        private final String email;
        private final Instant enrolledAt;
        private final Instant expiresAt;

        public EnrolledEmployee(String email, Duration validity) {
            this.email = email;
            this.enrolledAt = Instant.now();
            this.expiresAt = Instant.now().plus(validity);
        }

        public String getEmail() { return email; }
        public Instant getEnrolledAt() { return enrolledAt; }
        public Instant getExpiresAt() { return expiresAt; }
        public boolean isExpired() { return Instant.now().isAfter(expiresAt); }
        public long getDaysRemaining() {
            return Math.max(0, Duration.between(Instant.now(), expiresAt).toDays());
        }
    }

    public static class CorporatePartnerPlan {
        private final String companyName;
        private final int subsidyPercentage;
        private final int allocatedQuota;
        private final Duration passValidity;
        private final Map<String, EnrolledEmployee> enrollments = new ConcurrentHashMap<>();

        public CorporatePartnerPlan(String companyName, int subsidyPercentage, int allocatedQuota, Duration passValidity) {
            this.companyName = companyName;
            this.subsidyPercentage = subsidyPercentage;
            this.allocatedQuota = allocatedQuota;
            this.passValidity = passValidity;
        }

        // Clean up expired passes and dynamically free occupied quota slots
        public synchronized void purgeExpiredPasses() {
            enrollments.entrySet().removeIf(entry -> entry.getValue().isExpired());
        }

        public int getActivePassCount() {
            purgeExpiredPasses();
            return enrollments.size();
        }

        public int getRemainingPasses() {
            return Math.max(0, allocatedQuota - getActivePassCount());
        }

        public EnrolledEmployee getActiveEnrollment(String email) {
            purgeExpiredPasses();
            return enrollments.get(email);
        }

        public synchronized EnrolledEmployee enroll(String email) {
            purgeExpiredPasses();
            if (enrollments.containsKey(email)) {
                return enrollments.get(email);
            }
            if (enrollments.size() >= allocatedQuota) {
                return null;
            }
            EnrolledEmployee employee = new EnrolledEmployee(email, passValidity);
            enrollments.put(email, employee);
            return employee;
        }

        public String getCompanyName() { return companyName; }
        public int getSubsidyPercentage() { return subsidyPercentage; }
        public int getAllocatedQuota() { return allocatedQuota; }
    }

    // Corporate partner registry with contracted subsidies, quotas, and pass duration
    private static final Map<String, CorporatePartnerPlan> CORPORATE_PARTNERS = new ConcurrentHashMap<>();

    static {
        CORPORATE_PARTNERS.put("google.com", new CorporatePartnerPlan("Google", 100, 50, Duration.ofDays(365)));
        CORPORATE_PARTNERS.put("alphabet.com", new CorporatePartnerPlan("Alphabet", 100, 50, Duration.ofDays(365)));
        CORPORATE_PARTNERS.put("tcs.com", new CorporatePartnerPlan("Tata Consultancy Services", 60, 100, Duration.ofDays(365)));
        CORPORATE_PARTNERS.put("infosys.com", new CorporatePartnerPlan("Infosys", 50, 75, Duration.ofDays(365)));
        CORPORATE_PARTNERS.put("wipro.com", new CorporatePartnerPlan("Wipro", 50, 60, Duration.ofDays(365)));
        CORPORATE_PARTNERS.put("microsoft.com", new CorporatePartnerPlan("Microsoft", 80, 50, Duration.ofDays(365)));
        CORPORATE_PARTNERS.put("amazon.com", new CorporatePartnerPlan("Amazon", 75, 80, Duration.ofDays(365)));
        // Dedicated test partner with strict 2-seat quota for instant verification
        CORPORATE_PARTNERS.put("startup.com", new CorporatePartnerPlan("Tech Startup Co", 100, 2, Duration.ofDays(365)));
    }

    // Public / consumer email providers (strictly ineligible for corporate subsidies)
    private static final Set<String> PUBLIC_EMAIL_DOMAINS = Set.of(
            "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.in",
            "outlook.com", "hotmail.com", "live.com", "icloud.com",
            "mailinator.com", "tempmail.com", "proton.me", "protonmail.com");

    @PostMapping("/corporate/verify")
    @Operation(summary = "Verify corporate employee email, enforce quota limits, and track time-limit expiry")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyCorporate(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim().toLowerCase();

        // 1. Basic format validation
        int atIndex = email.indexOf('@');
        if (atIndex <= 0 || atIndex >= email.length() - 1 || !email.contains(".")) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("email", email);
            response.put("verified", false);
            response.put("subsidyPercentage", 0);
            response.put("message", "Please enter a valid work email address.");
            return ResponseEntity.ok(ApiResponse.success("Corporate verification status", response));
        }

        // 2. Extract exact domain after the '@' symbol
        String domain = email.substring(atIndex + 1);

        // 3. Reject public/consumer email providers
        if (PUBLIC_EMAIL_DOMAINS.contains(domain)) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("email", email);
            response.put("verified", false);
            response.put("subsidyPercentage", 0);
            response.put("message", "Personal email domains (@" + domain
                    + ") are not eligible for corporate subsidies. Please use your official company email.");
            return ResponseEntity.ok(ApiResponse.success("Corporate verification status", response));
        }

        // 4. Verify against authorized corporate partner registry
        if (CORPORATE_PARTNERS.containsKey(domain)) {
            CorporatePartnerPlan plan = CORPORATE_PARTNERS.get(domain);

            // Case A: Employee ALREADY ENROLLED & ACTIVE (Prevents duplicate quota burn)
            EnrolledEmployee existing = plan.getActiveEnrollment(email);
            if (existing != null) {
                Map<String, Object> response = new LinkedHashMap<>();
                response.put("email", email);
                response.put("verified", true);
                response.put("alreadyEnrolled", true);
                response.put("quotaExceeded", false);
                response.put("companyName", plan.getCompanyName());
                response.put("subsidyPercentage", plan.getSubsidyPercentage());
                response.put("allocatedQuota", plan.getAllocatedQuota());
                response.put("activePassCount", plan.getActivePassCount());
                response.put("remainingPasses", plan.getRemainingPasses());
                response.put("enrolledAt", existing.getEnrolledAt().toString());
                response.put("expiresAt", existing.getExpiresAt().toString());
                response.put("daysRemaining", existing.getDaysRemaining());
                response.put("message", "You have already been granted a " + plan.getSubsidyPercentage()
                        + "% corporate subsidy under " + plan.getCompanyName() + ". Your pass is active with "
                        + existing.getDaysRemaining() + " days remaining!");
                return ResponseEntity.ok(ApiResponse.success("Corporate verification status", response));
            }

            // Case B: Quota Limit Reached (Over Quota / Waitlist)
            if (plan.getActivePassCount() >= plan.getAllocatedQuota()) {
                Map<String, Object> response = new LinkedHashMap<>();
                response.put("email", email);
                response.put("verified", false);
                response.put("alreadyEnrolled", false);
                response.put("quotaExceeded", true);
                response.put("waitlisted", true);
                response.put("companyName", plan.getCompanyName());
                response.put("subsidyPercentage", 0);
                response.put("allocatedQuota", plan.getAllocatedQuota());
                response.put("activePassCount", plan.getActivePassCount());
                response.put("remainingPasses", 0);
                response.put("message", "Corporate quota of " + plan.getAllocatedQuota()
                        + " sponsored passes for " + plan.getCompanyName()
                        + " has been fully utilized. You have been placed on the corporate waitlist. Please contact your HR admin to request quota expansion.");
                return ResponseEntity.ok(ApiResponse.success("Corporate verification status", response));
            }

            // Case C: Eligible New Enrollment within Quota Limit
            EnrolledEmployee newEnrollment = plan.enroll(email);
            if (newEnrollment != null) {
                Map<String, Object> response = new LinkedHashMap<>();
                response.put("email", email);
                response.put("verified", true);
                response.put("alreadyEnrolled", false);
                response.put("firstTimeGrant", true);
                response.put("quotaExceeded", false);
                response.put("companyName", plan.getCompanyName());
                response.put("subsidyPercentage", plan.getSubsidyPercentage());
                response.put("allocatedQuota", plan.getAllocatedQuota());
                response.put("activePassCount", plan.getActivePassCount());
                response.put("remainingPasses", plan.getRemainingPasses());
                response.put("enrolledAt", newEnrollment.getEnrolledAt().toString());
                response.put("expiresAt", newEnrollment.getExpiresAt().toString());
                response.put("daysRemaining", newEnrollment.getDaysRemaining());
                response.put("message", "Corporate benefits verified for @" + domain + " (" + plan.getCompanyName()
                        + ")! " + plan.getSubsidyPercentage() + "% subsidy granted (" + plan.getRemainingPasses()
                        + " quota slots remaining). Valid for " + newEnrollment.getDaysRemaining() + " days.");
                return ResponseEntity.ok(ApiResponse.success("Corporate verification status", response));
            }
        }

        // 5. Unenrolled company domain
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("email", email);
        response.put("verified", false);
        response.put("subsidyPercentage", 0);
        response.put("message", "Company domain @" + domain
                + " is not currently enrolled in the FitEmpire Corporate Wellness program. Request a corporate proposal to enroll your team!");
        return ResponseEntity.ok(ApiResponse.success("Corporate verification status", response));
    }

}
