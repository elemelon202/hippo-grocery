Hippo Grocery (カバのお店)
The Problem
My wife doesn't know what to buy at the supermarket. She lacks the intuition I have from chef training — how to shop within budget, balance nutrition across a week, and turn a fridge full of ingredients into flexible meals. She also doesn't eat well and is underweight. Meal planners don't help because we don't know what we want to eat until the day comes.
Core Concept
A budget-first shopping app that builds a "capable fridge" instead of planning rigid meals. Daily dinner decisions happen when you're hungry, not a week ahead. A gamified hippo store rewards cooking variety without making nutrition feel like homework.
Context

We live in Japan (Japanese ingredients, seasonality, supermarket culture)
Small kitchen, no oven — air fryer is the main tool
Japanese meal structure: rice + soup + main + sides
Fresh ingredients, presentation matters
High-quality convenience store/depachika items are valid shortcuts


User Flows
Weekly: Smart Shopping

User sets weekly budget (e.g., ¥5000)
App generates a shopping list optimized for:

Budget constraints
Nutritional balance across the week
Ingredient overlap (one daikon, three uses)
Seasonal availability and value
Flexibility (supports multiple meal combinations)


At the store: substitution suggestions if prices differ ("豚こま expensive today → try 鶏むね, meals will adjust")
After shopping: user confirms what was bought → fridge inventory updates

Daily: What's for Dinner?

Open app → see what's in the fridge
Options ranked by:

What needs eating soon (spoilage priority)
Nutritional balance with recent meals
Effort level


"Surprise Me" button → App decides. No negotiation. Dinner is chosen.
Tap a meal → step-by-step with air fryer timings and coordination prompts ("Start rice now. Slice cucumber while air fryer runs.")

Meal Assembly Logic
Each meal follows the pattern:

One cooked main (air fryer handles this)
Supporting items: instant miso + fresh addition, cold tofu, pickles, pre-made sides, quick sunomono, etc.
App coordinates timing so everything lands together


Air Fryer as Core Engine
The air fryer solves the hardest part — the main dish:

Karaage, tonkatsu, korokke (crispy, no deep-fry mess)
Fish: 鮭, サバ, ホッケ (no smoke, no babysitting)
Yakitori, negima
Vegetables: renkon chips, kabocha

App stores times/temps and learns her specific air fryer model.

Gamification: The Hippo Store
Concept
A tiny grocery store run by hippos. It grows and flourishes based on her cooking activity.
Core Loop

She cooks a meal → ingredients used get "delivered" to the hippo store
Store starts as a small stall, expands over time
Variety unlocks new sections: fish counter, vegetable corner, meat section, etc.

Progression Elements

Hippo staff: New hippos join as the store grows. Personalities — fish specialist, checkout hippo, delivery hippo.
Rare ingredients: Use unusual items (ゴーヤ, 鯖, レンコン) → becomes a "specialty item" displayed proudly
Seasonal events: Autumn ingredients in autumn, store decorates, limited-edition hippos appear
Store reputation: Balanced meals boost reputation faster. Draws more animal customers.
Upgrades: Better refrigerator, nicer displays, delivery bicycle, expanded floor space

Why It Works

She's not "eating well" — she's growing her hippo shop
Nutrition goals are disguised as game progress
No guilt, no calorie counting
Variety is inherently rewarded (new stock = more ingredients tried)


Nutrition Philosophy
Embedded in the system, not shown to user:

Protein at every dinner
Vegetable variety across the week
Not too much sodium from convenience items
Balance tracked quietly — surfaced only as store health/reputation
Streaks noticed gently ("Protein every dinner this week") not scored loudly


Data Model (Rough)
Ingredients

name (JP/EN)
category (protein, vegetable, grain, etc.)
typical price range
seasonality
spoilage window
common pairings

Meals

ingredients required
air fryer times/temps (if applicable)
effort level
nutritional profile
assembly steps

Fridge State

current ingredients
purchase date
days until spoilage priority

Hippo Store

inventory (ingredients ever used)
store level / size
staff unlocked
reputation score
seasonal event state


Tone & Aesthetic

Cozy Japanese game feel (Neko Atsume, Kairosoft)
Warm, never judgmental
Simple, cute UI
Hippos are gentle and encouraging
Celebration of small wins, not optimization pressure


Future Ideas

Flyer integration (Shufoo/Tokubai) for real pricing
"Sam's rules" — I configure household food logic once (always have eggs, two fish meals a week, etc.)
Savings tracker → accumulates toward a treat meal out
Shared view so I can see how she's doing without surveillance feeling


Why Hippos?
Because we love them.
