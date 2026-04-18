// Test the date filtering logic without database
console.log("=== Testing Date Filtering Logic ===");

function testDateFilter(dateFilter) {
  console.log(`\nTesting dateFilter: ${dateFilter}`);
  
  let dateCondition, dateParam;
  
  if (dateFilter) {
    // Check if this is a specific date (Today/Yesterday) or a range (Last X days)
    const filterDate = new Date(dateFilter);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    filterDate.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
    
    const daysDiff = Math.floor((today - filterDate) / (1000 * 60 * 60 * 24));
    
    console.log(`  filterDate: ${filterDate.toDateString()}`);
    console.log(`  today: ${today.toDateString()}`);
    console.log(`  daysDiff: ${daysDiff}`);
    
    if (daysDiff === 0) {
      // Today - single date
      dateCondition = `date(timestamp) = ?`;
      dateParam = dateFilter;
    } else if (daysDiff === 1) {
      // Yesterday - single date
      dateCondition = `date(timestamp) = ?`;
      dateParam = dateFilter;
    } else if (daysDiff === 6) {
      // Last 7 days - from the filter date (6 days ago) to today
      dateCondition = `date(timestamp) >= date(?, 'localtime')`;
      dateParam = dateFilter;
    } else if (daysDiff === 29) {
      // Last 30 days - from the filter date (29 days ago) to today
      dateCondition = `date(timestamp) >= date(?, 'localtime')`;
      dateParam = dateFilter;
    } else {
      // For any other date, treat it as a range from that date to today
      dateCondition = `date(timestamp) >= date(?, 'localtime')`;
      dateParam = dateFilter;
    }
  } else {
    // Default to today
    dateCondition = `date(timestamp) = date('now', 'localtime')`;
    dateParam = null;
  }
  
  console.log(`  dateCondition: ${dateCondition}`);
  console.log(`  dateParam: ${dateParam}`);
  
  return { dateCondition, dateParam };
}

// Test different date filters
const today = new Date();
const todayStr = today.getFullYear() + "-" + 
                 String(today.getMonth() + 1).padStart(2, "0") + "-" + 
                 String(today.getDate()).padStart(2, "0");

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.getFullYear() + "-" + 
                    String(yesterday.getMonth() + 1).padStart(2, "0") + "-" + 
                    String(yesterday.getDate()).padStart(2, "0");

const last7Days = new Date(today);
last7Days.setDate(last7Days.getDate() - 6);
const last7DaysStr = last7Days.getFullYear() + "-" + 
                     String(last7Days.getMonth() + 1).padStart(2, "0") + "-" + 
                     String(last7Days.getDate()).padStart(2, "0");

console.log(`Today: ${todayStr}`);
console.log(`Yesterday: ${yesterdayStr}`);
console.log(`Last 7 days start: ${last7DaysStr}`);

testDateFilter(todayStr);
testDateFilter(yesterdayStr);
testDateFilter(last7DaysStr);
testDateFilter(null);

console.log("\n=== Test Complete ===");
