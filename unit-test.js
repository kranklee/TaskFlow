function add(a, b) {
    return a + b;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

console.log("🚀 Starting Unit Tests...\n");

try {
    const result = add(2, 3);
    if (result === 5) {
        console.log("✅ Test 1 (Addition): PASSED");
    } else {
        throw new Error(`Expected 5, Received ${result}`);
    }
} catch (error) {
    console.log("❌ Test 1: FAILED - " + error.message);
}

try {
    const result = formatDate("2025-12-25T10:00:00");
    if (result === "2025-12-25") {
        console.log("✅ Test 2 (Date Format): PASSED");
    } else {
        throw new Error(`Expected 2025-12-25, Received ${result}`);
    }
} catch (error) {
    console.log("❌ Test 2: FAILED - " + error.message);
}

console.log("\n✨ All Unit Tests Completed.");