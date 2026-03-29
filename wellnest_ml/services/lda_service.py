import re
from sklearn.decomposition import LatentDirichletAllocation
from sklearn.feature_extraction.text import CountVectorizer

WELLNESS_STOPWORDS = [
    "feeling", "felt", "feel", "today", "day", "time", "really", "just",
    "got", "get", "going", "went", "thing", "things", "little", "bit",
    "good", "bad", "okay", "fine", "much", "lot", "also", "still",
    "english", "stop", "words", "like", "know", "think", "want", "need",
]

TOPIC_LABELS = {
    frozenset(["family", "mother", "children", "home", "husband", "kids",
               "house", "cook", "chores", "care"]): ("Family Responsibilities", "🏠"),
    frozenset(["sleep", "tired", "rest", "awake", "night", "morning",
               "wake", "insomnia", "exhausted"]): ("Sleep Difficulties", "🌙"),
    frozenset(["work", "office", "job", "stress", "boss", "deadline",
               "meeting", "career", "pressure"]): ("Work Pressure", "💼"),
    frozenset(["health", "pain", "body", "doctor", "medicine", "headache",
               "back", "knee", "diet", "eat"]): ("Health Concerns", "🌿"),
    frozenset(["lonely", "alone", "miss", "friend", "social", "talk",
               "nobody", "isolated", "support"]): ("Emotional Isolation", "💕"),
    frozenset(["happy", "grateful", "wonderful", "blessed", "enjoyed",
               "loved", "peaceful", "calm", "joy"]): ("Positive Moments", "🌸"),
}


def preprocess_text(text: str) -> str:
    text = re.sub(r"[^a-zA-Z\s]", "", (text or "").lower())
    words = [w for w in text.split() if len(w) > 3 and w not in WELLNESS_STOPWORDS]
    return " ".join(words)


def get_topic_label(keywords: list) -> tuple:
    keyword_set = set(str(k).lower() for k in keywords)
    best_match = ("Personal Thoughts", "💭")
    best_overlap = 0
    for topic_keywords, (label, emoji) in TOPIC_LABELS.items():
        overlap = len(keyword_set & topic_keywords)
        if overlap > best_overlap:
            best_overlap = overlap
            best_match = (label, emoji)
    return best_match


def run_lda(notes: list, num_topics: int = 3):
    texts = [preprocess_text(n.get("text", "")) for n in notes if n.get("text")]
    texts = [t for t in texts if len(t.strip()) > 10]

    if len(texts) < 3:
        return [{
            "topic_id": 0,
            "label": "Not enough data yet",
            "keywords": [],
            "weight": 1.0,
            "emoji": "🌿",
        }]

    vectorizer = CountVectorizer(
        max_features=500,
        min_df=1,
        max_df=0.9,
        stop_words="english",
    )
    doc_term_matrix = vectorizer.fit_transform(texts)
    feature_names = vectorizer.get_feature_names_out()

    n_topics = max(1, min(num_topics, len(texts)))
    lda = LatentDirichletAllocation(
        n_components=n_topics,
        random_state=42,
        max_iter=20,
        learning_method="online",
    )
    lda.fit(doc_term_matrix)

    doc_topic_dist = lda.transform(doc_term_matrix)
    topic_weights = doc_topic_dist.mean(axis=0)

    topics = []
    for idx in range(n_topics):
        topic = lda.components_[idx]
        weight = float(topic_weights[idx]) if idx < len(topic_weights) else 0
        top_indices = topic.argsort()[:-11:-1]
        keywords = [str(feature_names[i]) for i in top_indices]
        label, emoji = get_topic_label(keywords)
        topics.append({
            "topic_id": idx,
            "label": label,
            "keywords": keywords[:5],
            "weight": round(weight, 3),
            "emoji": emoji,
        })

    topics.sort(key=lambda x: x["weight"], reverse=True)
    return topics


INSIGHT_TEMPLATES = {
    "Family Responsibilities": "Your notes often mention family duties. Remember — caring for yourself is also caring for them 💛",
    "Sleep Difficulties": "Sleep keeps coming up in your notes. Your rest matters deeply 🌙",
    "Work Pressure": "Work stress appears often. Small breaks matter more than you think 🌿",
    "Health Concerns": "You mention health often. Listening to your body is wisdom 🌸",
    "Emotional Isolation": "You may be feeling lonely at times. You are not alone — Nesti is here 💕",
    "Positive Moments": "Your notes carry so much light! Keep noticing these moments 🌸",
    "Personal Thoughts": "Your mind holds a lot. Journaling is a beautiful form of self-care 📝",
    "Not enough data yet": "Add a few more notes to unlock themes 🌿",
}


def get_insight_message(dominant_label: str) -> str:
    return INSIGHT_TEMPLATES.get(dominant_label, "Thank you for sharing your thoughts 💛")
