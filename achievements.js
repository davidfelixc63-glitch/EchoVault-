// =========================
// EchoVault Achievements
// =========================

const achievements = [

    // ---- Memory (15) ----
    { id: "first_memory", title: "🥇 First Memory", description: "Save your first memory.", category: "Memory", type: "totalMemories", goal: 1, hidden: false, unlocked: false, unlockedAt: null },
    { id: "getting_started", title: "🌱 Getting Started", description: "Save 5 memories.", category: "Memory", type: "totalMemories", goal: 5, hidden: false, unlocked: false, unlockedAt: null },
    { id: "storyteller", title: "📚 Storyteller", description: "Save 10 memories.", category: "Memory", type: "totalMemories", goal: 10, hidden: false, unlocked: false, unlockedAt: null },
    { id: "bronze_collector", title: "🪙 Bronze Collector", description: "Save 25 memories.", category: "Memory", type: "totalMemories", goal: 25, hidden: false, unlocked: false, unlockedAt: null },
    { id: "memory_keeper", title: "🌟 Memory Keeper", description: "Save 50 memories.", category: "Memory", type: "totalMemories", goal: 50, hidden: false, unlocked: false, unlockedAt: null },
    { id: "silver_collector", title: "🥈 Silver Collector", description: "Save 75 memories.", category: "Memory", type: "totalMemories", goal: 75, hidden: false, unlocked: false, unlockedAt: null },
    { id: "memory_master", title: "💎 Memory Master", description: "Save 100 memories.", category: "Memory", type: "totalMemories", goal: 100, hidden: false, unlocked: false, unlockedAt: null },
    { id: "golden_collector", title: "🥇 Golden Collector", description: "Save 150 memories.", category: "Memory", type: "totalMemories", goal: 150, hidden: false, unlocked: false, unlockedAt: null },
    { id: "milestone_maker", title: "🚩 Milestone Maker", description: "Save 200 memories.", category: "Memory", type: "totalMemories", goal: 200, hidden: false, unlocked: false, unlockedAt: null },
    { id: "archivist", title: "📜 Archivist", description: "Save 250 memories.", category: "Memory", type: "totalMemories", goal: 250, hidden: false, unlocked: false, unlockedAt: null },
    { id: "diamond_collector", title: "💠 Diamond Collector", description: "Save 300 memories.", category: "Memory", type: "totalMemories", goal: 300, hidden: false, unlocked: false, unlockedAt: null },
    { id: "century_plus", title: "🏅 Century Plus", description: "Save 400 memories.", category: "Memory", type: "totalMemories", goal: 400, hidden: false, unlocked: false, unlockedAt: null },
    { id: "living_library", title: "🏛️ Living Library", description: "Save 500 memories.", category: "Memory", type: "totalMemories", goal: 500, hidden: false, unlocked: false, unlockedAt: null },
    { id: "elite_archivist", title: "🏆 Elite Archivist", description: "Save 750 memories.", category: "Memory", type: "totalMemories", goal: 750, hidden: false, unlocked: false, unlockedAt: null },
    { id: "thousand_memories", title: "✨ Thousand Memories", description: "Save 1000 memories.", category: "Memory", type: "totalMemories", goal: 1000, hidden: false, unlocked: false, unlockedAt: null },

    // ---- Writing (8) ----
    { id: "first_words", title: "✏️ First Words", description: "Write your first memory.", category: "Writing", type: "totalMemories", goal: 1, hidden: false, unlocked: false, unlockedAt: null },
    { id: "long_story", title: "📖 Long Story", description: "Write a memory with 500+ characters.", category: "Writing", type: "descriptionLength", goal: 500, hidden: false, unlocked: false, unlockedAt: null },
    { id: "novelist", title: "📚 Novelist", description: "Write a memory with 1000+ characters.", category: "Writing", type: "descriptionLength", goal: 1000, hidden: false, unlocked: false, unlockedAt: null },
    { id: "heartfelt", title: "❤️ Heartfelt", description: "Save 25 memories in the Family & Loved Ones category.", category: "Writing", type: "categoryCount", targetCategory: "Family", goal: 25, hidden: false, unlocked: false, unlockedAt: null },
    
    { id: "creative_mind", title: "🎨 Creative Mind", description: "Use every category at least once.", category: "Writing", type: "allCategories", goal: 6, hidden: false, unlocked: false, unlockedAt: null },
    { id: "colorful_life", title: "🌈 Colorful Life", description: "Upload 100 photos.", category: "Writing", type: "imageCount", goal: 100, hidden: false, unlocked: false, unlockedAt: null },
    { id: "voice_keeper", title: "🎙️ Voice Keeper", description: "Record your first voice note.", category: "Writing", type: "voiceCount", goal: 1, hidden: false, unlocked: false, unlockedAt: null },
    { id: "echo_voice", title: "🎤 Echo Voice", description: "Record 50 voice notes.", category: "Writing", type: "voiceCount", goal: 50, hidden: false, unlocked: false, unlockedAt: null },

    // ---- Streak (7) ----
    { id: "streak_starter", title: "🔥 Streak Starter", description: "Reach a 3-day streak.", category: "Streak", type: "streak", goal: 3, hidden: false, unlocked: false, unlockedAt: null },
    { id: "streak_builder", title: "🔥 Streak Builder", description: "Reach a 7-day streak.", category: "Streak", type: "streak", goal: 7, hidden: false, unlocked: false, unlockedAt: null },
    { id: "two_weeks_strong", title: "🔥 Two Weeks Strong", description: "Reach a 14-day streak.", category: "Streak", type: "streak", goal: 14, hidden: false, unlocked: false, unlockedAt: null },
    { id: "monthly_devotion", title: "🔥 Monthly Devotion", description: "Reach a 30-day streak.", category: "Streak", type: "streak", goal: 30, hidden: false, unlocked: false, unlockedAt: null },
    { id: "quarter_committed", title: "🔥 Quarter Committed", description: "Reach a 60-day streak.", category: "Streak", type: "streak", goal: 60, hidden: false, unlocked: false, unlockedAt: null },
    { id: "half_year_hero", title: "🔥 Half-Year Hero", description: "Reach a 180-day streak.", category: "Streak", type: "streak", goal: 180, hidden: false, unlocked: false, unlockedAt: null },
    { id: "year_long_legend", title: "🔥 Year-Long Legend", description: "Reach a 365-day streak.", category: "Streak", type: "streak", goal: 365, hidden: false, unlocked: false, unlockedAt: null },


    // ---- Explorer (5) ----
    { id: "first_explorer", title: "🧭 First Explorer", description: "Visit every page in the app at least once.", category: "Explorer", type: "visitAllPages", goal: 8, hidden: false, unlocked: false, unlockedAt: null },
    { id: "frequent_visitor", title: "🧭 Frequent Visitor", description: "Rack up 50 total page visits.", category: "Explorer", type: "totalVisits", goal: 50, hidden: false, unlocked: false, unlockedAt: null },
    { id: "power_user", title: "🧭 Power User", description: "Rack up 150 total page visits.", category: "Explorer", type: "totalVisits", goal: 150, hidden: false, unlocked: false, unlockedAt: null },
    { id: "dashboard_devotee", title: "🧭 Dashboard Devotee", description: "Visit the Dashboard 20 times.", category: "Explorer", type: "pageVisitCount", targetPage: "dashboard", goal: 20, hidden: false, unlocked: false, unlockedAt: null },
    
    { id: "settings_tinkerer", title: "🧭 Settings Tinkerer", description: "Visit Settings 15 times.", category: "Explorer", type: "pageVisitCount", targetPage: "settings", goal: 15, hidden: false, unlocked: false, unlockedAt: null },

    // ---- Time (5) ----
    { id: "rookie_no_more", title: "⏳ Rookie No More", description: "Your EchoVault account turns 30 days old.", category: "Time", type: "accountAge", goal: 30, hidden: false, unlocked: false, unlockedAt: null },
    { id: "old_soul", title: "⏳ Old Soul", description: "Your EchoVault account turns 180 days old.", category: "Time", type: "accountAge", goal: 180, hidden: false, unlocked: false, unlockedAt: null },
    { id: "vault_veteran", title: "🎂 Vault Veteran", description: "Your EchoVault account turns 365 days old — happy anniversary!", category: "Time", type: "accountAge", goal: 365, hidden: false, unlocked: false, unlockedAt: null },
    { id: "night_owl", title: "🌙 Soft Landing", description: "Save a memory between midnight and 4am.", subtitle: "The quiet hours when the truth comes out.", category: "Story", type: "timeOfDay", startHour: 0, endHour: 4, hidden: true, unlocked: false, unlockedAt: null },
    
    
    { id: "early_bird", title: "🌤️ Dawn's Whisper", description: "Save a memory between 5am and 7am.", subtitle: "Before the world wakes, you were already paying attention.", category: "Story", type: "timeOfDay", startHour: 5, endHour: 7, hidden: true, unlocked: false, unlockedAt: null },
    
    { id: "still_breathing", title: "🌬️ Still Breathing", description: "Save a memory after a gap of 14+ days.", subtitle: "You came back. That's the whole story.", category: "Story", type: "returnAfterGap", goal: 14, hidden: true, unlocked: false, unlockedAt: null },
{ id: "the_gap", title: "🌉 The Gap", description: "Have two memories saved more than a year apart.", subtitle: "So much can happen in that much time — and you wrote some of it down.", category: "Story", type: "memorySpanYears", goal: 365, hidden: true, unlocked: false, unlockedAt: null },
{ id: "seasons", title: "🍂 Seasons", description: "Save a memory in each of the four seasons.", subtitle: "You kept watching, no matter the weather.", category: "Story", type: "allSeasons", goal: 4, hidden: true, unlocked: false, unlockedAt: null },
{ id: "after_midnight_truth", title: "🕯️ After Midnight Truth", description: "Save a memory between 1am and 4am that's over 400 characters.", subtitle: "The hour when honesty gets easier.", category: "Story", type: "lateNightDepth", startHour: 1, endHour: 4, goal: 400, hidden: true, unlocked: false, unlockedAt: null },
{ id: "i_still_dont_know", title: "🌫️ I Still Don't Know", description: "Write a memory that admits uncertainty.", subtitle: "Not knowing is still a kind of honesty.", category: "Story", type: "phraseMatch", phrases: ["i don't know", "i'm not sure"], hidden: true, unlocked: false, unlockedAt: null },
{ id: "borrowed_time", title: "🌇 Borrowed Time", description: "Save a memory on a Sunday evening.", subtitle: "The quiet hour before the week starts again.", category: "Story", type: "sundayEvening", afterHour: 17, hidden: true, unlocked: false, unlockedAt: null },
{ id: "the_archive_knows", title: "🗝️ The Archive Knows", description: "Unlock 10 Secret achievements.", subtitle: "The vault has been paying attention to you too.", category: "Story", type: "categoryUnlockCount", targetCategory: "Secret", goal: 10, hidden: true, unlocked: false, unlockedAt: null },

    
    // ---- Category (5) ----
    { id: "wanderers_journal", title: "🧳 Wanderer's Journal", description: "Save 25 memories in Travel & Adventure.", category: "Category", type: "categoryCount", targetCategory: "Travel", goal: 25, hidden: false, unlocked: false, unlockedAt: null },
    { id: "growing_strong", title: "🌱 Growing Strong", description: "Save 25 memories in Personal Growth.", category: "Category", type: "categoryCount", targetCategory: "Growth", goal: 25, hidden: false, unlocked: false, unlockedAt: null },
    { id: "natures_child", title: "🏔️ Nature's Child", description: "Save 25 memories in Nature & Serenity.", category: "Category", type: "categoryCount", targetCategory: "Nature", goal: 25, hidden: false, unlocked: false, unlockedAt: null },
    { id: "milestone_collector", title: "🎯 Milestone Collector", description: "Save 25 memories in Life Milestones.", category: "Category", type: "categoryCount", targetCategory: "Milestone", goal: 25, hidden: false, unlocked: false, unlockedAt: null },
    { id: "category_pioneer", title: "🏷️ Category Pioneer", description: "Create your very own custom category.", category: "Category", type: "customCategoryCreated", goal: 1, hidden: false, unlocked: false, unlockedAt: null },

    // ---- Secret (5) ----
    { id: "ghost_writer", title: "🕊️ Unfinished", description: "Save a memory with a title but no description.", subtitle: "Some things are still too tender for words.", category: "Story", type: "emptyDescription", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    
    { id: "deja_vu", title: "🌌 Returning", description: "Save a memory on the exact anniversary of your EchoVault join date.", subtitle: "You came back to the place where you began keeping yourself.", category: "Story", type: "anniversaryMemory", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    
    { id: "full_house", title: "🧩 Full House", description: "Have at least one memory in every category you've ever created.", category: "Secret", type: "allCategoriesIncludingCustom", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "both_worlds", title: "🦉 Both Worlds", description: "Unlock both Night Owl and Early Bird.", category: "Secret", type: "meta", requiredIds: ["night_owl", "early_bird"], goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "multimedia_maven", title: "💫 Alive", description: "Save a single memory with both a photo and a voice note.", subtitle: "Sight and sound. The moment, kept whole.", category: "Story", type: "multimedia", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    

    { id: "new_year_new_memory", title: "🎇 New Year, New Memory", description: "Save a memory on January 1st.", category: "Secret", type: "calendarDate", month: 0, day: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "spooky_season", title: "🎃 Spooky Season", description: "Save a memory on October 31st.", category: "Secret", type: "calendarDate", month: 9, day: 31, hidden: true, unlocked: false, unlockedAt: null },
    { id: "sweetheart", title: "💝 Sweetheart", description: "Save a memory on February 14th.", category: "Secret", type: "calendarDate", month: 1, day: 14, hidden: true, unlocked: false, unlockedAt: null },
    { id: "merry_christmas", title: "🎄 Merry Christmas!", description: "Save a memory on December 25th.", category: "Secret", type: "calendarDate", month: 11, day: 25, hidden: true, unlocked: false, unlockedAt: null },
    { id: "egg_hunt", title: "🐰 Egg Hunt", description: "Save a memory on Easter Sunday.", category: "Secret", type: "easterDate", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "palindrome", title: "🔁 Palindrome", description: "Save a memory with a title that reads the same forwards and backwards.", category: "Secret", type: "palindromeTitle", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "war_and_peace", title: "📖 War and Peace", description: "Write a memory with 2000+ characters.", category: "Secret", type: "descriptionLength", goal: 2000, hidden: true, unlocked: false, unlockedAt: null },
    { id: "perfectly_balanced", title: "⚖️ Perfectly Balanced", description: "Save a memory where the title and description are exactly the same length.", category: "Secret", type: "balancedLengths", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "trilogy", title: "🎪 Trilogy", description: "Save 3 memories in a single day.", category: "Secret", type: "sameDayCount", goal: 3, hidden: true, unlocked: false, unlockedAt: null },
    { id: "category_hopper", title: "🌍 Category Hopper", description: "Save memories in 3 different categories in the same day.", category: "Secret", type: "sameDayCategories", goal: 3, hidden: true, unlocked: false, unlockedAt: null },
    { id: "true_colors", title: "🎨 True Colors", description: "Try every accent color available.", category: "Secret", type: "allAccentsUsed", goal: 5, hidden: true, unlocked: false, unlockedAt: null },
    { id: "backup_buff", title: "📤 Backup Buff", description: "Export your memories at least once.", category: "Secret", type: "hasExported", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "time_restorer", title: "📥 Time Restorer", description: "Import a backup at least once.", category: "Secret", type: "hasImported", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "fresh_start", title: "🧹 Fresh Start", description: "Use Delete All Memories at least once.", category: "Secret", type: "hasDeletedAll", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "needle_in_haystack", title: "🔍 Needle in a Haystack", description: "Search for something that returns zero results.", category: "Secret", type: "hasZeroSearchResult", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "achievement_hunter", title: "🥇 Achievement Hunter", description: "Unlock 25 total achievements.", category: "Secret", type: "totalUnlocked", goal: 25, hidden: true, unlocked: false, unlockedAt: null },
    { id: "completionist", title: "🏆 Completionist", description: "Unlock every non-secret achievement.", category: "Secret", type: "completionist", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "late_bloomer", title: "🐣 Late Bloomer", description: "Wait 30+ days after joining before saving your first memory.", category: "Secret", type: "lateBloomer", goal: 30, hidden: true, unlocked: false, unlockedAt: null },
    { id: "love_letter", title: "💌 Love Letter", description: "Save a Family memory with 500+ characters.", category: "Secret", type: "categoryLength", targetCategory: "Family", goal: 500, hidden: true, unlocked: false, unlockedAt: null },
    { id: "photo_essay", title: "📸 Photo Essay", description: "Save 10 memories that all have images.", category: "Secret", type: "imageCount", goal: 10, hidden: true, unlocked: false, unlockedAt: null },
    { id: "say_my_name", title: "🔊 Say My Name", description: "Mention EchoVault in a memory's title or description.", category: "Secret", type: "mentionsAppName", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "deep_thoughts", title: "🕯️ Midnight Letter", description: "Save a memory at exactly midnight.", subtitle: "You met the new day with a story.", category: "Story", type: "exactTime", hour: 0, minute: 0, hidden: true, unlocked: false, unlockedAt: null },
    
  { id: "angel_numbers", title: "🔮 Eleven Eleven", description: "Save a memory at exactly 11:11.", subtitle: "A small wish, written down.", category: "Story", type: "exactTime", hour: 11, hour2: 23, minute: 11, hidden: true, unlocked: false, unlockedAt: null },
  
    { id: "abracadabra", title: "🪄 Abracadabra", description: "Save a memory with the word 'magic' in the title.", category: "Secret", type: "titleContains", word: "magic", hidden: true, unlocked: false, unlockedAt: null },
    { id: "just_testing", title: "🧪 Just Testing", description: "Save a memory titled exactly 'Test'.", category: "Secret", type: "titleExact", value: "Test", hidden: true, unlocked: false, unlockedAt: null },
    { id: "origin_story", title: "👶 Origin Story", description: "Favourite your very first-ever saved memory.", category: "Secret", type: "favouritedFirst", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    { id: "wildcard", title: "🌱 Roots", description: "Save a memory using a custom category you created.", subtitle: "You made space for a part of your life that didn't have a name yet.", category: "Story", type: "usedCustomCategory", goal: 1, hidden: true, unlocked: false, unlockedAt: null },
    
    { id: "easter_egg_hunter", title: "🏆 Easter Egg Hunter", description: "Unlock every other Secret achievement.", category: "Secret", type: "meta", requiredIds: ["ghost_writer","deja_vu","full_house","both_worlds","multimedia_maven","new_year_new_memory","spooky_season","sweetheart","merry_christmas","egg_hunt","palindrome","war_and_peace","perfectly_balanced","trilogy","category_hopper","true_colors","backup_buff","time_restorer","fresh_start","needle_in_haystack","achievement_hunter","completionist","late_bloomer","love_letter","photo_essay","say_my_name","deep_thoughts","angel_numbers","copycat","abracadabra","just_testing","origin_story","wildcard"], goal: 1, hidden: true, unlocked: false, unlockedAt: null }

];

const userAchievements = loadAchievements();

// =========================
// Load Achievements
// =========================

function loadAchievements() {

    const savedAchievements = localStorage.getItem("echovault_achievements");

    if (savedAchievements) {
        const saved = JSON.parse(savedAchievements);
        const savedById = new Map(saved.map(a => [a.id, a]));

        // Always rebuild from the master achievements list so any
        // updated static fields (title, description, category, etc.)
        // stay in sync — but keep each achievement's real unlock
        // progress from what's actually saved.
        const merged = achievements.map(masterAchievement => {
            const existing = savedById.get(masterAchievement.id);
            if (existing) {
             
             return {
                    ...masterAchievement,
                    unlocked: existing.unlocked,
                    unlockedAt: existing.unlockedAt,
                    triggeredByMemoryId: existing.triggeredByMemoryId || null
                };
            }
            return masterAchievement;
        });

        saveAchievements(merged);
        return merged;
    }

    saveAchievements(achievements);

    return achievements;

}


// =========================
// Save Achievements
// =========================

function saveAchievements(updatedAchievements) {

    localStorage.setItem(
        "echovault_achievements",
        JSON.stringify(updatedAchievements)
    );

}



// =========================
// Unlock Achievement
// =========================

function unlockAchievement(id, triggerMemoryId) {

    const achievement = userAchievements.find(a => a.id === id);

    if (!achievement || achievement.unlocked) return;

    achievement.unlocked = true;
    achievement.unlockedAt = new Date().toISOString();
    achievement.triggeredByMemoryId = triggerMemoryId || null;

    saveAchievements(userAchievements);
    renderAchievements();

    if (typeof showAchievementToast === "function") {
        showAchievementToast(achievement);
    } else {
        showToast(`🏆 Achievement Unlocked: ${achievement.title}`);
    }
}


// =========================
// Check Achievements
// =========================

// Calculates the date of Easter Sunday for a given year
function getEasterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return { month: month - 1, day: day };
}

function checkAchievements(triggerMemoryId) {
    

    const memories = getMemories();

    const totalMemories = memories.length;
    const totalImages = memories.filter(m => m.image).length;
    const totalVoice = memories.filter(m => m.voice).length;
    const builtInCategories = ["Travel", "Family", "Growth", "Milestone", "Nature"];
    const usedCategories = new Set(memories.map(m => m.category));

    userAchievements.forEach(achievement => {

        if (achievement.unlocked) return;

        let earned = false;

        switch (achievement.type) {

            case "totalMemories":
                earned = totalMemories >= achievement.goal;
                break;

            case "descriptionLength":
                earned = memories.some(m => m.description && m.description.length >= achievement.goal);
                break;

            case "categoryCount":
                earned = memories.filter(m => m.category === achievement.targetCategory).length >= achievement.goal;
                break;

            case "allCategories":
                earned = builtInCategories.every(cat => usedCategories.has(cat));
                break;

            case "imageCount":
                earned = totalImages >= achievement.goal;
                break;

            case "voiceCount":
                earned = totalVoice >= achievement.goal;
                break;

case "streak":
                earned = parseInt(localStorage.getItem("echovault_longestStreak") || "0") >= achievement.goal;
                break;

            case "visitAllPages": {
                const visits = JSON.parse(localStorage.getItem("echovault_pageVisits") || "{}");
                earned = Object.keys(visits).length >= achievement.goal;
                break;
            }

            case "totalVisits": {
                const visits = JSON.parse(localStorage.getItem("echovault_pageVisits") || "{}");
                const total = Object.values(visits).reduce((sum, count) => sum + count, 0);
                earned = total >= achievement.goal;
                break;
            }

case "pageVisitCount": {
                const visits = JSON.parse(localStorage.getItem("echovault_pageVisits") || "{}");
                earned = (visits[achievement.targetPage] || 0) >= achievement.goal;
                break;
            }

            case "accountAge": {
                const joinDate = new Date(localStorage.getItem("echovault_joinDate"));
                const daysSinceJoin = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
                earned = daysSinceJoin >= achievement.goal;
                break;
            }

            case "timeOfDay":
                earned = memories.some(m => {
                    const hour = new Date(m.date).getHours();
                    return hour >= achievement.startHour && hour < achievement.endHour;
                });
                break;

            case "customCategoryCreated": {
                const customCats = JSON.parse(localStorage.getItem("echovault_customCategories") || "[]");
                earned = customCats.length >= achievement.goal;
                break;
            }

            case "emptyDescription":
                earned = memories.some(m => m.title && (!m.description || m.description.trim() === ""));
                break;

            case "anniversaryMemory": {
                const joinDate = new Date(localStorage.getItem("echovault_joinDate"));
                earned = memories.some(m => {
                    const d = new Date(m.date);
                    return d.getDate() === joinDate.getDate() &&
                           d.getMonth() === joinDate.getMonth() &&
                           d.getFullYear() > joinDate.getFullYear();
                });
                break;
            }

            case "allCategoriesIncludingCustom": {
                const customCats = JSON.parse(localStorage.getItem("echovault_customCategories") || "[]");
                const allCatValues = [...builtInCategories, ...customCats.map(c => c.value || c)];
                earned = allCatValues.length > 0 && allCatValues.every(cat => usedCategories.has(cat));
                break;
            }

            case "meta":
                earned = achievement.requiredIds.every(reqId => {
                    const req = userAchievements.find(a => a.id === reqId);
                    return req && req.unlocked;
                });
                break;

            case "multimedia":
                earned = memories.some(m => m.image && m.voice);
                break;

            case "calendarDate":
                earned = memories.some(m => {
                    const d = new Date(m.date);
                    return d.getMonth() === achievement.month && d.getDate() === achievement.day;
                });
                break;

            case "easterDate":
                earned = memories.some(m => {
                    const d = new Date(m.date);
                    const easter = getEasterDate(d.getFullYear());
                    return d.getMonth() === easter.month && d.getDate() === easter.day;
                });
                break;

            case "palindromeTitle":
                earned = memories.some(m => {
                    const clean = (m.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                    return clean.length > 1 && clean === clean.split("").reverse().join("");
                });
                break;

            case "balancedLengths":
                earned = memories.some(m => m.title && m.description && m.title.length === m.description.length);
                break;

            case "sameDayCount": {
                const dateGroups = {};
                memories.forEach(m => {
                    const key = new Date(m.date).toDateString();
                    dateGroups[key] = (dateGroups[key] || 0) + 1;
                });
                earned = Object.values(dateGroups).some(count => count >= achievement.goal);
                break;
            }

            case "sameDayCategories": {
                const dateCatGroups = {};
                memories.forEach(m => {
                    const key = new Date(m.date).toDateString();
                    if (!dateCatGroups[key]) dateCatGroups[key] = new Set();
                    if (m.category) dateCatGroups[key].add(m.category);
                });
                earned = Object.values(dateCatGroups).some(set => set.size >= achievement.goal);
                break;
            }

            case "allAccentsUsed": {
                const accentsUsed = JSON.parse(localStorage.getItem("echovault_accentsUsed") || "[]");
                earned = accentsUsed.length >= achievement.goal;
                break;
            }

            case "hasExported":
                earned = localStorage.getItem("echovault_hasExported") === "true";
                break;

            case "hasImported":
                earned = localStorage.getItem("echovault_hasImported") === "true";
                break;

            case "hasDeletedAll":
                earned = localStorage.getItem("echovault_hasDeletedAll") === "true";
                break;

            case "hasZeroSearchResult":
                earned = localStorage.getItem("echovault_hasZeroSearchResult") === "true";
                break;

            case "totalUnlocked":
                earned = userAchievements.filter(a => a.unlocked).length >= achievement.goal;
                break;

            case "completionist":
                earned = userAchievements.filter(a => !a.hidden).every(a => a.unlocked);
                break;

            case "lateBloomer": {
                if (memories.length === 0) break;
                const joinDate = new Date(localStorage.getItem("echovault_joinDate"));
                const earliest = memories.reduce((old, m) => new Date(m.date) < new Date(old.date) ? m : old, memories[0]);
                const daysDiff = Math.floor((new Date(earliest.date) - joinDate) / (1000 * 60 * 60 * 24));
                earned = daysDiff >= achievement.goal;
                break;
            }

            case "categoryLength":
                earned = memories.some(m => m.category === achievement.targetCategory && m.description && m.description.length >= achievement.goal);
                break;

            case "mentionsAppName":
                earned = memories.some(m =>
                    (m.title && m.title.toLowerCase().includes("echovault")) ||
                    (m.description && m.description.toLowerCase().includes("echovault"))
                );
                break;

            case "exactTime":
                earned = memories.some(m => {
                    const d = new Date(m.date);
                    const h = d.getHours();
                    const min = d.getMinutes();
                    const hourMatch = h === achievement.hour || (achievement.hour2 !== undefined && h === achievement.hour2);
                    return hourMatch && min === achievement.minute;
                });
                break;

            case "duplicateTitle": {
                const titleCounts = {};
                memories.forEach(m => {
                    const t = (m.title || "").trim().toLowerCase();
                    if (t) titleCounts[t] = (titleCounts[t] || 0) + 1;
                });
                earned = Object.values(titleCounts).some(count => count >= 2);
                break;
            }

            case "titleContains":
                earned = memories.some(m => m.title && m.title.toLowerCase().includes(achievement.word));
                break;

            case "titleExact":
                earned = memories.some(m => m.title && m.title.trim().toLowerCase() === achievement.value.toLowerCase());
                break;

            case "favouritedFirst": {
                if (memories.length === 0) break;
                const first = memories.reduce((old, m) => m.id < old.id ? m : old, memories[0]);
                earned = first.favourite === true;
                break;
            }

            case "usedCustomCategory": {
                const customCats = JSON.parse(localStorage.getItem("echovault_customCategories") || "[]");
                const customCatValues = customCats.map(c => c.value || c);
                earned = memories.some(m => customCatValues.includes(m.category));
                break;
            }

            case "returnAfterGap": {
                const sorted = [...memories].sort((a, b) => new Date(a.date) - new Date(b.date));
                earned = sorted.some((m, i) => {
                    if (i === 0) return false;
                    const gapDays = (new Date(m.date) - new Date(sorted[i - 1].date)) / (1000 * 60 * 60 * 24);
                    return gapDays >= achievement.goal;
                });
                break;
            }

            case "memorySpanYears": {
                if (memories.length < 2) break;
                const dates = memories.map(m => new Date(m.date).getTime());
                const spanDays = (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24);
                earned = spanDays >= achievement.goal;
                break;
            }

            case "allSeasons": {
                const getSeason = (month) => {
                    if ([11, 0, 1].includes(month)) return "Winter";
                    if ([2, 3, 4].includes(month)) return "Spring";
                    if ([5, 6, 7].includes(month)) return "Summer";
                    return "Fall";
                };
                const seasonsUsed = new Set(memories.map(m => getSeason(new Date(m.date).getMonth())));
                earned = seasonsUsed.size >= achievement.goal;
                break;
            }

            case "lateNightDepth":
                earned = memories.some(m => {
                    const d = new Date(m.date);
                    const h = d.getHours();
                    return h >= achievement.startHour && h < achievement.endHour && m.description && m.description.length >= achievement.goal;
                });
                break;

            case "phraseMatch":
                earned = memories.some(m => m.description && achievement.phrases.some(p => m.description.toLowerCase().includes(p)));
                break;

            case "sundayEvening":
                earned = memories.some(m => {
                    const d = new Date(m.date);
                    return d.getDay() === 0 && d.getHours() >= achievement.afterHour;
                });
                break;

            case "categoryUnlockCount":
                earned = userAchievements.filter(a => a.category === achievement.targetCategory && a.unlocked).length >= achievement.goal;
                break;
        }
        
      if (earned) {
            unlockAchievement(achievement.id, triggerMemoryId);
        }
        
    });

}

function formatAchievementDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// =========================
// Render Achievements
// =========================

function renderAchievements() {

    const list = document.getElementById("achievementList");
    if (!list) return;

    const memories = getMemories();
    
    const totalMemories = memories.length;
    const totalImages = memories.filter(m => m.image).length;
    const totalVoice = memories.filter(m => m.voice).length;
    const builtInCategories = ["Travel", "Family", "Growth", "Milestone", "Nature"];
    const usedCategories = new Set(memories.map(m => m.category));

    list.innerHTML = "";

  const categoryOrder = ["Memory", "Writing", "Story", "Streak", "Explorer", "Time", "Category", "Secret"];
    const categoryEmoji = {
        Memory: "📸",
        Writing: "✍️",
        Story: "💛",
        Streak: "🔥",
        Explorer: "🧭",
        Time: "⏳",
        Category: "🗂️",
        Secret: "🔒"
    };
    
    const categoryStyles = {
        Memory:   { border: "ach-border-memory",   iconBg: "ach-icon-memory",   text: "ach-text-memory" },
        Writing:  { border: "ach-border-writing",  iconBg: "ach-icon-writing",  text: "ach-text-writing" },
        Story:    { border: "ach-border-story",    iconBg: "ach-icon-story",    text: "ach-text-story" },
        Streak:   { border: "ach-border-streak",   iconBg: "ach-icon-streak",   text: "ach-text-streak" },
        Explorer: { border: "ach-border-explorer", iconBg: "ach-icon-explorer", text: "ach-text-explorer" },
        Time:     { border: "ach-border-time",     iconBg: "ach-icon-time",     text: "ach-text-time" },
        Category: { border: "ach-border-category", iconBg: "ach-icon-category", text: "ach-text-category" },
        Secret:   { border: "ach-border-secret",   iconBg: "ach-icon-secret",   text: "ach-text-secret" }
    };
    
       const categoryTagline = {
        Memory: "Memories you've chosen to keep close.",
        Writing: "The words you took the time to write.",
        Story: "Moments the vault noticed were more than just entries.",
        Streak: "Times you showed up for your own story.",
        Explorer: "The corners of your vault you've explored.",
        Time: "Marks of time you paid attention to.",
        Category: "The different parts of your life you've made room for.",
        Secret: "Secrets the vault noticed."
    };
    

    categoryOrder.forEach(categoryName => {

        const group = userAchievements.filter(a => a.category === categoryName);
        if (group.length === 0) return;

        const unlockedCount = group.filter(a => a.unlocked).length;
        const totalCount = group.length;

        const visibleGroup = group.filter(a => !a.hidden || a.unlocked);
        if (visibleGroup.length === 0) return;

       const groupHeader = document.createElement("div");
        groupHeader.className = "mt-8 mb-3 first:mt-0";
        groupHeader.innerHTML = `
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    <span>${categoryEmoji[categoryName] || "🏆"}</span>
                    <span>${categoryName}</span>
                </h3>
                <span class="text-sm text-zinc-400">${unlockedCount} / ${totalCount} unlocked</span>
            </div>
            <p class="text-xs text-zinc-500 italic mt-1">${categoryTagline[categoryName] || ""}</p>
        `;
        list.appendChild(groupHeader);
        

        const sortedGroup = [...visibleGroup].sort((a, b) => {
            if (a.unlocked && !b.unlocked) return -1;
            if (!a.unlocked && b.unlocked) return 1;
            return 0;
        });

        sortedGroup.forEach(achievement => {

            const card = document.createElement("div");
        const style = categoryStyles[categoryName] || categoryStyles.Memory;

        card.className = achievement.unlocked
            ? `flex items-center gap-4 bg-zinc-800 border-2 ${style.border} rounded-2xl p-4`
            : "flex items-center gap-4 bg-zinc-800 border border-zinc-700 rounded-2xl p-4 opacity-40 grayscale";
            
            let progressHTML = `<p class="text-xs text-zinc-500 mt-1">Locked</p>`;

            if (!achievement.unlocked) {

                let current = 0;
                let goal = achievement.goal || 1;

                switch (achievement.type) {
                    case "totalMemories":
                        current = totalMemories;
                        break;
                    case "descriptionLength":
                        current = memories.reduce((max, m) => Math.max(max, (m.description || "").length), 0);
                        break;
                    case "categoryCount":
                        current = memories.filter(m => m.category === achievement.targetCategory).length;
                        break;
                    case "allCategories":
                        current = builtInCategories.filter(cat => usedCategories.has(cat)).length;
                        goal = builtInCategories.length;
                        break;
                    case "imageCount":
                        current = totalImages;
                        break;

                    case "voiceCount":
                        current = totalVoice;
                        break;
                    case "streak":
                        current = parseInt(localStorage.getItem("echovault_longestStreak") || "0");
                        break;
                    case "visitAllPages": {
                        const visits = JSON.parse(localStorage.getItem("echovault_pageVisits") || "{}");
                        current = Object.keys(visits).length;
                        break;
                    }
                    case "totalVisits": {
                        const visits = JSON.parse(localStorage.getItem("echovault_pageVisits") || "{}");
                        current = Object.values(visits).reduce((sum, count) => sum + count, 0);
                        break;
                    }
                    case "pageVisitCount": {
                        const visits = JSON.parse(localStorage.getItem("echovault_pageVisits") || "{}");
                        current = visits[achievement.targetPage] || 0;
                        break;
                    }
                    case "accountAge": {
                        const joinDate = new Date(localStorage.getItem("echovault_joinDate"));
                        current = Math.floor((new Date() - joinDate) / (1000 * 60 * 60 * 24));
                        break;
                    }
                    case "customCategoryCreated": {
                        const customCats = JSON.parse(localStorage.getItem("echovault_customCategories") || "[]");
                        current = customCats.length;
                        break;
                    }
                }

                const percent = Math.min(100, Math.floor((current / goal) * 100));

                progressHTML = `
                    <div class="mt-2 w-full bg-zinc-700 rounded-full h-2">
                        <div class="bg-cyan-400 h-2 rounded-full" style="width:${percent}%"></div>
                    </div>
                    <p class="text-xs text-zinc-500 mt-1">${current}/${goal} (${percent}%)</p>
                `;
            }

            const triggerMemory = achievement.triggeredByMemoryId
            ? memories.find(m => m.id === achievement.triggeredByMemoryId)
            : null;

      card.innerHTML = `
                <div class="text-3xl flex-shrink-0 ${achievement.unlocked ? `${style.iconBg} rounded-full w-14 h-14 flex items-center justify-center` : ""}">${achievement.title.split(" ")[0]}</div>
                
                <div class="flex-1">
                    <h4 class="font-bold text-white">${achievement.title}</h4>
                    <p class="text-sm text-zinc-400">${achievement.description}</p>
                    ${achievement.subtitle ? `<p class="text-xs text-amber-300/70 italic mt-1">${achievement.subtitle}</p>` : ""}
                    
                    ${achievement.unlocked
                        ? `<p class="text-xs ${style.text} mt-1">Unlocked ${formatAchievementDate(achievement.unlockedAt)}</p>
                        
                       <div class="flex flex-wrap gap-2 mt-2">
                       ${triggerMemory
                           ? `<button onclick="viewMemory(${triggerMemory.id})" class="flex items-center gap-1.5 ${style.iconBg} hover:opacity-80 ${style.border} border ${style.text} text-xs font-medium px-3 py-1.5 rounded-full transition">
                                  📖 Triggered by "${triggerMemory.title}" →
                              </button>`
                           : ""}
                       <button onclick="shareAchievementCard('${achievement.id}')" class="flex items-center gap-1.5 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-full transition">
                           📤 Share
                       </button>
                       </div>`
                       : progressHTML}
                </div>
            `;

            list.appendChild(card);
            
        });

    });

}

renderAchievements();

    
function generateAchievementShareCard(achievement) {

    const categoryHex = {
        Memory: "#06b6d4", Writing: "#8b5cf6", Story: "#fbbf24",
        Streak: "#f97316", Explorer: "#14b8a6", Time: "#6366f1",
        Category: "#10b981", Secret: "#d946ef"
    };

    const accent = categoryHex[achievement.category] || categoryHex.Memory;

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1080;
    const ctx = canvas.getContext("2d");

    // Background
    const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    bgGradient.addColorStop(0, "#18181b");
    bgGradient.addColorStop(1, "#09090b");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // Larger, softer accent glow behind icon for more depth
    const glow = ctx.createRadialGradient(540, 360, 20, 540, 360, 380);
    glow.addColorStop(0, accent + "55");
    glow.addColorStop(0.4, accent + "22");
    glow.addColorStop(1, accent + "00");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1080);

    // Border frame — slightly thicker + more rounded for a premium feel
    ctx.strokeStyle = accent;
    ctx.lineWidth = 8;
    roundRect(ctx, 36, 36, 1008, 1008, 48);
    ctx.stroke();

    // Subtle inner border for extra polish
    ctx.strokeStyle = accent + "44";
    ctx.lineWidth = 2;
    roundRect(ctx, 48, 48, 984, 984, 40);
    ctx.stroke();

    // Category label
    ctx.font = "600 26px system-ui, sans-serif";
    ctx.fillStyle = accent;
    ctx.textAlign = "center";
    ctx.letterSpacing = "4px";
    ctx.fillText(achievement.category.toUpperCase(), 540, 130);

    // Icon (emoji)
    const parts = achievement.title.split(" ");
    ctx.font = "170px system-ui, sans-serif";
    ctx.fillText(parts[0], 540, 370);

    // Title
    ctx.font = "700 62px system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(parts.slice(1).join(" "), 540, 490);

    // Description / subtitle — more breathing room
    const bodyText = achievement.subtitle || achievement.description;
    ctx.font = "italic 32px system-ui, sans-serif";
    ctx.fillStyle = "#a1a1aa";
    wrapText(ctx, bodyText, 540, 575, 780, 48);

    // Unlocked date — clearer hierarchy and better spacing
    ctx.font = "600 32px system-ui, sans-serif";
    ctx.fillStyle = accent;
    const dateLabel = achievement.unlockedAt
        ? `Unlocked ${formatAchievementDate(achievement.unlockedAt)}`
        : "";
    ctx.fillText(dateLabel, 540, 820);

    // Footer branding — tighter and cleaner
    ctx.font = "700 32px system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("EchoVault", 540, 930);

    ctx.font = "24px system-ui, sans-serif";
    ctx.fillStyle = "#71717a";
    const userName = getUserName();
    const footerSubtext = userName ? `${userName}'s vault • Local only` : "Private vault • Local only";
    ctx.fillText(footerSubtext, 540, 975);
    
    return canvas;
}



function renderShowcase() {

    const grid = document.getElementById("showcaseGrid");
    const emptyState = document.getElementById("showcaseEmptyState");
    const summaryCount = document.getElementById("showcaseSummaryCount");
    if (!grid) return;

    const categoryHex = {
        Memory: "#06b6d4", Writing: "#8b5cf6", Story: "#fbbf24",
        Streak: "#f97316", Explorer: "#14b8a6", Time: "#6366f1",
        Category: "#10b981", Secret: "#d946ef"
    };

    const unlocked = userAchievements.filter(a => a.unlocked)
        .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt));

    const total = userAchievements.length;

    summaryCount.textContent = `${unlocked.length} / ${total}`;

    grid.innerHTML = "";

    if (unlocked.length === 0) {
        emptyState.classList.remove("hidden");
        grid.classList.add("hidden");
        return;
    }

    emptyState.classList.add("hidden");
    grid.classList.remove("hidden");

    unlocked.forEach(achievement => {

        const accent = categoryHex[achievement.category] || categoryHex.Memory;
        const parts = achievement.title.split(" ");

        const card = document.createElement("div");
        card.className = "bg-zinc-800 border-2 rounded-2xl p-5 flex flex-col gap-2 cursor-pointer hover:opacity-90 transition";
        card.style.borderColor = accent;
        card.onclick = () => previewAchievementCard(achievement.id);
        
        card.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="text-3xl">${parts[0]}</div>
                <span class="text-xs font-semibold px-2 py-1 rounded-full" style="color:${accent}; background:${accent}22;">
                    ${achievement.category}
                </span>
            </div>
            <h4 class="font-bold text-white mt-1">${parts.slice(1).join(" ")}</h4>
            <p class="text-xs text-zinc-400">${achievement.subtitle || achievement.description}</p>
        <p class="text-xs mt-1" style="color:${accent};">Unlocked ${formatAchievementDate(achievement.unlockedAt)}</p>
        
           <button
                onclick="event.stopPropagation(); shareAchievementCard('${achievement.id}')"
                class="mt-2 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 text-zinc-200 text-xs font-medium px-3 py-2 rounded-full transition self-start">
                📤 Share this one
            </button>
            
        `;

        grid.appendChild(card);
    });

}

function previewAchievementCard(achievementId) {

    const achievement = userAchievements.find(a => a.id === achievementId);
    if (!achievement || !achievement.unlocked) return;

    const canvas = generateAchievementShareCard(achievement);

    document.getElementById("achievementPreviewImage").src = canvas.toDataURL("image/png");
    document.getElementById("achievementPreviewShareBtn").onclick = () => shareAchievementCard(achievementId);

    document.getElementById("achievementPreviewModal").classList.remove("hidden");
    document.getElementById("achievementPreviewModal").classList.add("flex");

}

function closeAchievementPreview() {
    document.getElementById("achievementPreviewModal").classList.add("hidden");
    document.getElementById("achievementPreviewModal").classList.remove("flex");
}


function generateShowcaseSummaryCard() {

    const categoryHex = {
        Memory: "#06b6d4", Writing: "#8b5cf6", Story: "#fbbf24",
        Streak: "#f97316", Explorer: "#14b8a6", Time: "#6366f1",
        Category: "#10b981", Secret: "#d946ef"
    };

    const categoryOrder = ["Memory", "Writing", "Story", "Streak", "Explorer", "Time", "Category", "Secret"];

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");

    const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1350);
    bgGradient.addColorStop(0, "#18181b");
    bgGradient.addColorStop(1, "#09090b");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1080, 1350);

    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 6;
    roundRect(ctx, 30, 30, 1020, 1290, 40);
    ctx.stroke();

    ctx.textAlign = "center";

    ctx.font = "700 56px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("🏆 My EchoVault", 540, 150);
    ctx.fillText("Achievements", 540, 220);

    const unlocked = userAchievements.filter(a => a.unlocked);
    const total = userAchievements.length;

    ctx.font = "700 120px sans-serif";
    ctx.fillStyle = "#22d3ee";
    ctx.fillText(`${unlocked.length} / ${total}`, 540, 380);

    ctx.font = "32px sans-serif";
    ctx.fillStyle = "#a1a1aa";
    ctx.fillText("achievements unlocked", 540, 430);

    let y = 540;
    categoryOrder.forEach(cat => {
        const catTotal = userAchievements.filter(a => a.category === cat).length;
        const catUnlocked = userAchievements.filter(a => a.category === cat && a.unlocked).length;
        if (catTotal === 0) return;

        const accent = categoryHex[cat];

        ctx.textAlign = "left";
        ctx.font = "600 34px sans-serif";
        ctx.fillStyle = accent;
        ctx.fillText(cat, 120, y);

        ctx.textAlign = "right";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`${catUnlocked} / ${catTotal}`, 960, y);

        // progress bar
        const barWidth = 840;
        const pct = catTotal > 0 ? catUnlocked / catTotal : 0;
        ctx.fillStyle = "#3f3f46";
        ctx.fillRect(120, y + 20, barWidth, 14);
        ctx.fillStyle = accent;
        ctx.fillRect(120, y + 20, barWidth * pct, 14);

        y += 90;
    });

    ctx.textAlign = "center";
    ctx.font = "700 34px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("EchoVault", 540, 1250);

    ctx.font = "26px sans-serif";
    ctx.fillStyle = "#71717a";
    ctx.fillText("Private vault • Local only", 540, 1290);

    return canvas;
}

async function shareShowcaseSummary() {

    const canvas = generateShowcaseSummaryCard();

    canvas.toBlob(async (blob) => {

        const fileName = "echovault-achievements-summary.png";
        const file = new File([blob], fileName, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {

            try {
                await navigator.share({
                    files: [file],
                    title: "My EchoVault Achievements",
                    text: "Here's my private EchoVault achievement collection!"
                });
            } catch (err) {
                // cancelled
            }

        } else {

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            showToast("📥 Achievement summary downloaded!");

        }

    }, "image/png");

}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
}



function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let lines = [];

    words.forEach(word => {
        const testLine = line + word + " ";
        if (ctx.measureText(testLine).width > maxWidth && line !== "") {
            lines.push(line);
            line = word + " ";
        } else {
            line = testLine;
        }
    });
    lines.push(line);

    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((l, i) => {
        ctx.fillText(l.trim(), x, startY + i * lineHeight);
    });
}

async function shareAchievementCard(achievementId) {

    const achievement = userAchievements.find(a => a.id === achievementId);
    if (!achievement || !achievement.unlocked) return;

    const canvas = generateAchievementShareCard(achievement);

    canvas.toBlob(async (blob) => {

        const fileName = `echovault-${achievement.id}.png`;
        const file = new File([blob], fileName, { type: "image/png" });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {

            try {
                await navigator.share({
                    files: [file],
                    title: achievement.title,
                    text: `I unlocked "${achievement.title}" in EchoVault!`
                });
            } catch (err) {
                // User cancelled the share sheet — no action needed
            }

        } else {

            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            showToast("📥 Achievement card downloaded!");

        }

    }, "image/png");

}

// =========================
// Reset Achievements
// =========================

function resetAchievements() {

    userAchievements.forEach(a => {
        a.unlocked = false;
        a.unlockedAt = null;
    });

    saveAchievements(userAchievements);
    renderAchievements();

}
