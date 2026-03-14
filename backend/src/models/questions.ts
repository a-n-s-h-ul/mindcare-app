import { Question } from './types';

// Sourced from questions-bank.json
export const questions: Question[] = [
    {
        "id": "Q1",
        "section": "A",
        "text": "On a typical weekend, compared to weekdays, you tend to sleep…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "About the same amount (±1 hour)", "score": 0 },
            { "letter": "B", "text": "2–3 hours longer", "score": 1 },
            { "letter": "C", "text": "Much longer (4+ hours)", "score": 2 },
            { "letter": "D", "text": "Less than on weekdays", "score": 3 }
        ],
        "domain": ["Sleep"],
        "weight": 0.25,
        "indicator": "Circadian rhythm disruption",
        "mandatory": true,
        "followUp": null
    },
    {
        "id": "Q2",
        "section": "A",
        "text": "Which statement best describes your typical energy throughout the day?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "I start strong in the morning and maintain energy through afternoon/evening.", "score": 0 },
            { "letter": "B", "text": "I'm slow to start, but hit my stride by mid-morning and keep going.", "score": 1 },
            { "letter": "C", "text": "I have energy bursts at unpredictable times; it's hard to predict my pattern.", "score": 2 },
            { "letter": "D", "text": "I feel most tired in the afternoon/evening, regardless of sleep.", "score": 3 }
        ],
        "domain": ["Sleep"],
        "weight": 0.25,
        "indicator": "Fatigue patterns",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q3",
        "section": "A",
        "text": "You feel most mentally sharp and alert at…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Early morning (before 8 AM)", "score": 0 },
            { "letter": "B", "text": "Mid-morning (8 AM – 12 PM)", "score": 1 },
            { "letter": "C", "text": "Afternoon (12 PM – 5 PM)", "score": 2 },
            { "letter": "D", "text": "Late evening (after 8 PM)", "score": 3 }
        ],
        "domain": ["Sleep"],
        "weight": 0.20,
        "indicator": "Chronotype and circadian phase",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q4",
        "section": "A",
        "text": "How consistent is your bedtime throughout the week?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Very consistent—within 1 hour every night", "score": 0 },
            { "letter": "B", "text": "Mostly consistent—within 1–2 hours on most nights", "score": 1 },
            { "letter": "C", "text": "Quite variable—anywhere from 11 PM to 2 AM", "score": 2 },
            { "letter": "D", "text": "Extremely variable—sometimes 2 AM, sometimes 4 AM, no real pattern", "score": 3 }
        ],
        "domain": ["Sleep"],
        "weight": 0.22,
        "indicator": "Sleep consistency",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q5",
        "section": "A",
        "text": "During a typical academic week—NOT during exams or major deadlines—how do you perceive time passing in your day?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Time flows quickly; I'm often surprised how fast the day went.", "score": 0 },
            { "letter": "B", "text": "Time feels normal—I can roughly estimate how much has passed.", "score": 1 },
            { "letter": "C", "text": "Time drags occasionally, especially in the afternoon/evening.", "score": 2 },
            { "letter": "D", "text": "Time often feels slow or stuck; hours feel long.", "score": 3 }
        ],
        "domain": ["Sleep"],
        "weight": 0.18,
        "indicator": "Time perception (depression/dissociation marker)",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q6",
        "section": "B",
        "text": "When you have an assignment or task due, you typically…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Start immediately or within a day; completion feels manageable.", "score": 0 },
            { "letter": "B", "text": "Start a few days before; some pressure, but you find your rhythm.", "score": 1 },
            { "letter": "C", "text": "Feel stuck starting; you often begin the day before.", "score": 2 },
            { "letter": "D", "text": "Delay until crisis mode; the deadline pressure is what gets you moving.", "score": 3 }
        ],
        "domain": ["Avoidance"],
        "weight": 0.25,
        "indicator": "Task initiation/procrastination",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q7a",
        "section": "B",
        "text": "When faced with routine decisions (what to wear, what to eat), you typically…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Decide very quickly, without much thought.", "score": 0 },
            { "letter": "B", "text": "Decide quickly; you mostly trust your judgment.", "score": 1 },
            { "letter": "C", "text": "Decide at a normal pace; you think it through and then choose.", "score": 2 },
            { "letter": "D", "text": "Decide very slowly; you often overthink even small choices.", "score": 3 }
        ],
        "domain": ["Avoidance"],
        "weight": 0.15,
        "indicator": "Decision speed",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q7b",
        "section": "B",
        "text": "After making an important decision (course choice, project, relationship), how often do you re-examine or second-guess it?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Rarely—you're generally confident in your choice.", "score": 0 },
            { "letter": "B", "text": "Sometimes—you occasionally reconsider but move on.", "score": 1 },
            { "letter": "C", "text": "Fairly often—you revisit your reasoning and what-ifs.", "score": 2 },
            { "letter": "D", "text": "Very often—you constantly reconsider and worry if you made the wrong choice.", "score": 3 }
        ],
        "domain": ["Rumination"],
        "weight": 0.18,
        "indicator": "Decision rumination",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q8",
        "section": "B",
        "text": "When something doesn't go as planned or you make a mistake, your first thought is typically…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "\"How can I fix this? What's the next step?\"", "score": 0 },
            { "letter": "B", "text": "\"I'm frustrated, but I'll figure out what happened.\"", "score": 1 },
            { "letter": "C", "text": "\"I keep replaying it in my mind, thinking what I should have done differently.\"", "score": 2 },
            { "letter": "D", "text": "\"I'm just not good at this; I feel ashamed.\"", "score": 3 }
        ],
        "domain": ["Rumination"],
        "weight": 0.30,
        "indicator": "Post-failure rumination & shame (GOLD-STANDARD depression marker)",
        "mandatory": true,
        "followUp": null
    },
    {
        "id": "Q9",
        "section": "B",
        "text": "During a typical academic week—NOT during exams or major deadlines—in the evening when winding down or trying to sleep, your mind typically…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Is calm; you can relax relatively easily.", "score": 0 },
            { "letter": "B", "text": "Has some activity, but you can still focus on sleep.", "score": 1 },
            { "letter": "C", "text": "Is busy with thoughts about your day or tomorrow.", "score": 2 },
            { "letter": "D", "text": "Cycles through worries, regrets, or concerns repeatedly.", "score": 3 }
        ],
        "domain": ["Rumination"],
        "weight": 0.25,
        "indicator": "Evening rumination",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q10",
        "section": "B",
        "text": "When you imagine life next semester, next year, or after graduation, you tend to feel…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Hopeful or excited about possibilities.", "score": 0 },
            { "letter": "B", "text": "Neutral; you don't think about it much.", "score": 1 },
            { "letter": "C", "text": "Uncertain—some possibilities seem good, others concerning.", "score": 2 },
            { "letter": "D", "text": "Pessimistic; it's hard to imagine things working out well.", "score": 3 }
        ],
        "domain": ["Rumination"],
        "weight": 0.30,
        "indicator": "Hopelessness/Future orientation (CRITICAL SUICIDE SCREENING)",
        "mandatory": true,
        "followUp": null
    },
    {
        "id": "Q11",
        "section": "C",
        "text": "When you're in a group setting (class, party, hostel common room, dining hall), you typically feel…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Comfortable—you're engaged or can easily engage if you want.", "score": 0 },
            { "letter": "B", "text": "Mostly comfortable, though sometimes you feel a bit on the outside.", "score": 1 },
            { "letter": "C", "text": "Uncertain if you belong—you observe more than you participate.", "score": 2 },
            { "letter": "D", "text": "Like an outsider—it's hard to feel like part of the group.", "score": 3 }
        ],
        "domain": ["Isolation"],
        "weight": 0.25,
        "indicator": "Social belonging",
        "mandatory": false,
        "followUp": "Q11b"
    },
    {
        "id": "Q11b",
        "section": "C",
        "text": "When you ARE in social situations and WANT to participate, how easy is it for you to join conversations or activities?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Very easy—I can join in without much effort.", "score": 0 },
            { "letter": "B", "text": "Usually manageable—I can join, though I may feel a bit hesitant.", "score": 1 },
            { "letter": "C", "text": "Often difficult—I feel anxious or unsure about joining in.", "score": 2 },
            { "letter": "D", "text": "Very difficult—I mostly avoid participating even when I want to.", "score": 3 }
        ],
        "domain": ["Isolation"],
        "weight": 0.18,
        "indicator": "Engagement ability (differentiates introversion from anxiety/depression)",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q12",
        "section": "C",
        "text": "When it comes to reaching out to friends, attending social events, or initiating plans…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "You do it naturally; it doesn't feel like effort.", "score": 0 },
            { "letter": "B", "text": "You do it, but you often prefer when others initiate.", "score": 1 },
            { "letter": "C", "text": "You do it less often; you often feel hesitant.", "score": 2 },
            { "letter": "D", "text": "You rarely do it; you mostly wait for invitations or withdraw.", "score": 3 }
        ],
        "domain": ["Isolation"],
        "weight": 0.27,
        "indicator": "Social initiation/behavioral activation",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q13",
        "section": "C",
        "text": "If you told a close friend or family member that you were really struggling emotionally or mentally, how confident are you that they would listen, understand, and help without judgment?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Very confident—they would be fully supportive.", "score": 0 },
            { "letter": "B", "text": "Mostly confident—they would try to help, even if they don't fully get it.", "score": 1 },
            { "letter": "C", "text": "Somewhat confident—they might help, but there could be conditions or judgment.", "score": 2 },
            { "letter": "D", "text": "Not confident—they would likely judge, pressure, or dismiss how you feel.", "score": 3 }
        ],
        "domain": ["Isolation"],
        "weight": 0.24,
        "indicator": "Perceived support (non-judgmental)",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q14",
        "section": "C",
        "text": "Without thinking about social media or online content, how often do you find yourself comparing your life, achievements, or appearance to others around you?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Rarely—you mostly focus on your own path.", "score": 0 },
            { "letter": "B", "text": "Sometimes—it happens, but it doesn't bother you much.", "score": 1 },
            { "letter": "C", "text": "Fairly often—you notice and think about how you compare to peers.", "score": 2 },
            { "letter": "D", "text": "Very often—comparison and self-judgment are a constant background.", "score": 3 }
        ],
        "domain": ["Rumination"],
        "weight": 0.20,
        "indicator": "Social comparison (offline focus)",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q15",
        "section": "D",
        "text": "In decisions that directly affect YOUR future (career path, academic choices, relationships, daily priorities), how much control do you feel you have?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "High control—my choices meaningfully shape my outcomes.", "score": 0 },
            { "letter": "B", "text": "Moderate control—I have some say, though others' input matters.", "score": 1 },
            { "letter": "C", "text": "Low control—family or others' expectations often override what I want.", "score": 2 },
            { "letter": "D", "text": "Very low control—I feel that others' decisions or circumstances mostly decide for me.", "score": 3 }
        ],
        "domain": ["Control"],
        "weight": 0.30,
        "indicator": "Perceived control/learned helplessness",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q16",
        "section": "D",
        "text": "How often do you find yourself going through \"what if\" scenarios like \"what if I fail\", \"what if they judge me\", or \"what if things go wrong\"?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Rarely—you don't tend to rehearse worst-case scenarios.", "score": 0 },
            { "letter": "B", "text": "Sometimes—it happens occasionally.", "score": 1 },
            { "letter": "C", "text": "Fairly often—you anticipate potential problems a lot.", "score": 2 },
            { "letter": "D", "text": "Very often—your mind regularly cycles through potential bad outcomes.", "score": 3 }
        ],
        "domain": ["Rumination"],
        "weight": 0.26,
        "indicator": "Catastrophizing/worry",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q17",
        "section": "D",
        "text": "How much conflict do you experience between what others (family, society, peers) expect from you and who you actually want to be?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Very little conflict—I mostly feel aligned with my own values and choices.", "score": 0 },
            { "letter": "B", "text": "Some conflict—I have to navigate between expectations and what I want.", "score": 1 },
            { "letter": "C", "text": "Significant conflict—I often feel pressure to be different from who I am.", "score": 2 },
            { "letter": "D", "text": "Severe conflict—I feel pulled in opposing directions most of the time.", "score": 3 }
        ],
        "domain": ["Control"],
        "weight": 0.18,
        "indicator": "Identity conflict (cultural/external pressure)",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q18",
        "section": "D",
        "text": "When someone gives you good evidence that one of your beliefs or opinions might be wrong, how easy is it for you to consider changing your view?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Quite easy—I can usually think it through and consider changing.", "score": 0 },
            { "letter": "B", "text": "Sometimes possible—it depends on how confident I was before.", "score": 1 },
            { "letter": "C", "text": "Rarely—I tend to stick with my view even when I hear other sides.", "score": 2 },
            { "letter": "D", "text": "Very rarely—I find it very difficult to reconsider, even with strong evidence.", "score": 3 }
        ],
        "domain": ["Rumination"],
        "weight": 0.19,
        "indicator": "Cognitive flexibility",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q19",
        "section": "E",
        "text": "When you're stressed or overwhelmed, you typically…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Take action—exercise, talk to someone, or work directly on the problem.", "score": 0 },
            { "letter": "B", "text": "Use a combination of action and relaxation—exercise, time with friends, and rest.", "score": 1 },
            { "letter": "C", "text": "Try to distract yourself—social media, games, shows—to take your mind off it.", "score": 2 },
            { "letter": "D", "text": "Withdraw—you need isolation and tend to ruminate alone.", "score": 3 }
        ],
        "domain": ["Avoidance"],
        "weight": 0.27,
        "indicator": "Coping strategy (active vs. avoidant)",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q20",
        "section": "E",
        "text": "When dealing with stress or difficult emotions, do you use substances (alcohol, drugs, medications, energy drinks, nicotine, caffeine, etc.) to help you feel better?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Rarely or never.", "score": 0 },
            { "letter": "B", "text": "Occasionally—a few times a month.", "score": 1 },
            { "letter": "C", "text": "Frequently—several times a week.", "score": 2 },
            { "letter": "D", "text": "Daily or as a primary coping strategy.", "score": 3 }
        ],
        "domain": ["Avoidance"],
        "weight": 0.18,
        "indicator": "Substance self-medication",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q21",
        "section": "E",
        "text": "How frequently do you engage in physical activity (exercise, sports, active recreation like walking or outdoor games)?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Several times a week—it's part of your routine.", "score": 0 },
            { "letter": "B", "text": "Once or twice a week.", "score": 1 },
            { "letter": "C", "text": "A few times a month.", "score": 2 },
            { "letter": "D", "text": "Rarely or never.", "score": 3 }
        ],
        "domain": ["Avoidance"],
        "weight": 0.24,
        "indicator": "Behavioral activation/physical activity",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q22",
        "section": "E",
        "text": "How consistent are your habits around self-care (showering, grooming, eating regular meals)?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Very consistent—you maintain these habits daily.", "score": 0 },
            { "letter": "B", "text": "Mostly consistent—you slip occasionally but quickly get back on track.", "score": 1 },
            { "letter": "C", "text": "Inconsistent—you sometimes neglect these habits.", "score": 2 },
            { "letter": "D", "text": "Very inconsistent—these habits often slip, especially when stressed.", "score": 3 }
        ],
        "domain": ["Avoidance"],
        "weight": 0.30,
        "indicator": "Self-care consistency",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q23",
        "section": "F",
        "text": "How would you describe your typical sleep quality?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Good—you generally sleep through or wake briefly.", "score": 0 },
            { "letter": "B", "text": "Mostly good—occasional disruption.", "score": 1 },
            { "letter": "C", "text": "Mixed—you often wake during the night or have trouble falling asleep.", "score": 2 },
            { "letter": "D", "text": "Poor—you frequently have difficulty sleeping or wake multiple times.", "score": 3 }
        ],
        "domain": ["Sleep"],
        "weight": 0.26,
        "indicator": "Sleep quality",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q24",
        "section": "F",
        "text": "During the night, you typically…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Sleep through or wake only once briefly.", "score": 0 },
            { "letter": "B", "text": "Wake once or twice but fall back asleep quickly.", "score": 1 },
            { "letter": "C", "text": "Wake multiple times; it takes effort to fall back asleep.", "score": 2 },
            { "letter": "D", "text": "Frequently wake throughout the night; sleep feels very fragmented.", "score": 3 }
        ],
        "domain": ["Sleep"],
        "weight": 0.32,
        "indicator": "Sleep fragmentation/early morning awakening",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q25",
        "section": "F",
        "text": "How do you typically wake in the morning?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Naturally, at a consistent time; you wake feeling relatively alert.", "score": 0 },
            { "letter": "B", "text": "Naturally, though sometimes groggier than others.", "score": 1 },
            { "letter": "C", "text": "You often wake earlier than you'd like, and feel groggy.", "score": 2 },
            { "letter": "D", "text": "You frequently wake very early (4–5 AM) and can't fall back asleep, or sleep until very late.", "score": 3 }
        ],
        "domain": ["Sleep"],
        "weight": 0.35,
        "indicator": "Early morning awakening (HIGHEST WEIGHT - DEPRESSION BIOMARKER)",
        "mandatory": true,
        "followUp": null
    },
    {
        "id": "Q26",
        "section": "F",
        "text": "Compared to your freshman year or before college, how has your daytime sleepiness changed?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "I'm less sleepy than before.", "score": 0 },
            { "letter": "B", "text": "About the same as before.", "score": 1 },
            { "letter": "C", "text": "More sleepy now; frequent naps becoming a habit.", "score": 2 },
            { "letter": "D", "text": "Much more sleepy; napping almost daily now, which is new for me.", "score": 3 }
        ],
        "domain": ["Sleep"],
        "weight": 0.22,
        "indicator": "Daytime sleepiness (individual change)",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q27",
        "section": "G",
        "text": "To what extent does your academic performance determine your sense of worth and personal happiness?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "My worth comes from many things; grades are just one measure.", "score": 0 },
            { "letter": "B", "text": "Grades matter, but my worth depends on effort, not just results.", "score": 1 },
            { "letter": "C", "text": "Performance is important; doing well affects my self-esteem significantly.", "score": 2 },
            { "letter": "D", "text": "My grades determine my worth; failure feels like personal inadequacy.", "score": 3 }
        ],
        "domain": ["Perfectionism"],
        "weight": 0.23,
        "indicator": "Academic worth-linkage (pathological perfectionism)",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q28",
        "section": "G",
        "text": "If you received a low grade on an assignment or test, you would…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Feel disappointed, but quickly move on and focus on doing better next time.", "score": 0 },
            { "letter": "B", "text": "Feel upset, but understand it as a learning opportunity.", "score": 1 },
            { "letter": "C", "text": "Ruminate about it for a few days; it affects your mood.", "score": 2 },
            { "letter": "D", "text": "Feel deeply ashamed or inadequate; it's hard to move past it.", "score": 3 }
        ],
        "domain": ["Rumination"],
        "weight": 0.30,
        "indicator": "Failure response & shame",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q29",
        "section": "G",
        "text": "When you succeed academically or in other areas, you typically feel…",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Pride—you recognize your competence.", "score": 0 },
            { "letter": "B", "text": "Satisfied—you know you worked for it.", "score": 1 },
            { "letter": "C", "text": "Some doubt about whether you deserve it; luck or help played a role.", "score": 2 },
            { "letter": "D", "text": "Like a fraud—you're convinced others will eventually discover you're not as capable as they think.", "score": 3 }
        ],
        "domain": ["Perfectionism"],
        "weight": 0.22,
        "indicator": "Impostor syndrome",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q30",
        "section": "H",
        "text": "Are there activities or things you typically find enjoyable (hobbies, hanging out, games, food, etc.)?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Yes, several—you look forward to them and they bring genuine pleasure.", "score": 0 },
            { "letter": "B", "text": "Yes, some—you enjoy them when you do them, but don't always feel motivated.", "score": 1 },
            { "letter": "C", "text": "A few things, but you don't get as much out of them as you used to.", "score": 2 },
            { "letter": "D", "text": "Not really—even things that used to bring joy feel kind of flat or pointless.", "score": 3 }
        ],
        "domain": ["Anhedonia"],
        "weight": 0.33,
        "indicator": "Loss of pleasure (CARDINAL DEPRESSION SYMPTOM)",
        "mandatory": true,
        "followUp": null
    },
    {
        "id": "Q31",
        "section": "H",
        "text": "Over the past few weeks, how would you describe your emotional range?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "You experience a full range of emotions throughout the week.", "score": 0 },
            { "letter": "B", "text": "You mostly feel okay, with some variation.", "score": 1 },
            { "letter": "C", "text": "Your emotions feel muted; you don't feel as much intensity as usual.", "score": 2 },
            { "letter": "D", "text": "You feel emotionally numb or flat; even things that should evoke emotion don't.", "score": 3 }
        ],
        "domain": ["Anhedonia"],
        "weight": 0.32,
        "indicator": "Emotional blunting",
        "mandatory": false,
        "followUp": null
    },
    {
        "id": "Q32",
        "section": "H",
        "text": "Overall, how satisfied are you with your life right now?",
        "type": "forced_choice",
        "options": [
            { "letter": "A", "text": "Quite satisfied—life feels meaningful and worth living.", "score": 0 },
            { "letter": "B", "text": "Mostly satisfied—there are challenges, but generally good.", "score": 1 },
            { "letter": "C", "text": "Moderately satisfied—mixed feelings; some good parts, some hard parts.", "score": 2 },
            { "letter": "D", "text": "Quite dissatisfied—it's hard to see the value or meaning in your life right now.", "score": 3 }
        ],
        "domain": ["Anhedonia"],
        "weight": 0.33,
        "indicator": "Life satisfaction & meaning (CRITICAL SUICIDE SCREENING)",
        "mandatory": true,
        "followUp": null
    },
    {
        "id": "V1",
        "section": "Voice",
        "text": "Question 1 — Emotional State\n\nOver the past few weeks, how would you describe your general emotional state during daily life?\nYou can talk about your mood, motivation, and whether you still enjoy the activities you used to like.",
        "type": "voice_recording",
        "options": [],
        "domain": ["Voice Analysis"],
        "weight": 0.25,
        "indicator": "Vocal tone and mood tracking",
        "mandatory": true,
        "followUp": null
    },
    {
        "id": "V2",
        "section": "Voice",
        "text": "Question 2 — Stress & Coping\n\nThink about a recent situation in college where you felt stressed or overwhelmed.\nPlease describe what happened and how you handled that situation.",
        "type": "voice_recording",
        "options": [],
        "domain": ["Voice Analysis"],
        "weight": 0.25,
        "indicator": "Stress response and coping tone",
        "mandatory": true,
        "followUp": null
    },
    {
        "id": "V3",
        "section": "Voice",
        "text": "Question 3 — Social Connection\n\nHow connected do you currently feel with the people around you, such as friends, classmates, or family?\nDo you feel comfortable sharing your thoughts with them?",
        "type": "voice_recording",
        "options": [],
        "domain": ["Voice Analysis"],
        "weight": 0.25,
        "indicator": "Social connection signaling",
        "mandatory": true,
        "followUp": null
    },
    {
        "id": "V4",
        "section": "Voice",
        "text": "Question 4 — Future Outlook\n\nWhen you think about your future, such as your studies, career, or life after graduation, what thoughts or feelings usually come to mind?",
        "type": "voice_recording",
        "options": [],
        "domain": ["Voice Analysis"],
        "weight": 0.25,
        "indicator": "Future orientation and hopefulness",
        "mandatory": true,
        "followUp": null
    }
];
