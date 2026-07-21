# Tutorservices Education Topic Cluster Strategy

## Niche Analysis

Education search demand usually combines several dimensions: learning mode, subject, class, board or exam, and location. Tutorservices should answer these needs through strong pillar pages and useful supporting guides rather than creating hundreds of thin pages.

The site serves three connected intents:

- **Transactional:** find a tutor, request a demo, compare home and online tuition, or register as a tutor.
- **Commercial research:** compare tuition formats, understand tutor selection, and check subjects, classes or locations.
- **Informational:** learn study techniques, exam preparation methods, spoken English routines, and online learning practices.

The conversion path is: educational answer → relevant pillar → supporting guide → student or tutor registration.

## Six Core Clusters

| Cluster | Pillar URL | Primary intent | Current supporting pages |
| --- | --- | --- | --- |
| Home Tuition | `/home-tuition` | Understand and request personal tuition at home | Benefits guide, selection guide, locations, student enquiry |
| Online Tuition | `/online-tuition` | Compare and request live online tutoring | Online learning tips, courses, spoken English, student enquiry |
| Subjects | `/courses` | Find support by academic subject or skill | Services, spoken English, Class 10 preparation, student enquiry |
| Classes | `/classes` | Find tuition from Class 1 to 12 | Courses, Class 10 preparation, exam preparation, student enquiry |
| Exams | `/exam-preparation` | Build school, board or foundation exam support | Class 10 guide, courses, online tips, student enquiry |
| Cities | `/locations` | Check home-tuition areas and nationwide online access | Home tuition, online tuition, services, student enquiry |

## Internal Linking Architecture

1. The homepage and broad utility pages link to all six pillars.
2. Every pillar links to its supporting resources and conversion page.
3. Every supporting page links back to its primary pillar.
4. Pages shared by multiple topics link to each relevant pillar.
5. Related pillars cross-link where user intent naturally overlaps.
6. All public pages remain reachable from the homepage within two clicks.

The architecture is generated from `topic-cluster-data.js`. Add a future page to the relevant `members` array and map its primary cluster in `pageCluster`; the generator then creates consistent hub, member and related-topic links.

## Expansion Roadmap

Create a new page only when it can provide distinct, useful content and a clear conversion path.

### Home and Online Tuition

- One-to-one tuition
- Group tuition
- Tuition for CBSE students
- Tuition for ICSE students
- How to choose a verified tutor

### Subjects

- Mathematics tuition
- Science tuition
- English tuition
- Accounts and commerce tuition
- Computer science and coding tuition

### Classes

- Primary tuition for Classes 1 to 5
- Middle-school tuition for Classes 6 to 8
- Class 9 and Class 10 tuition
- Class 11 and Class 12 tuition

### Exams

- Class 12 board exam preparation
- Mathematics board exam preparation
- Science board exam preparation
- JEE foundation preparation
- NEET foundation preparation

### Cities

- Home tuition in New Delhi
- Home tuition in South Delhi
- Home tuition in Dwarka
- Home tuition in Rohini
- Online tuition in India

Local pages should include genuine service details, areas covered, mode availability, FAQs and a local enquiry path. Avoid duplicating the same copy with only the city name changed.

## Anchor Text Guidelines

- Use descriptive but varied anchors such as “compare learning formats,” “view Class 10 guidance,” or “check tutor availability.”
- Use exact service names where they help navigation, especially on pillar cards.
- Avoid repeating one keyword-rich anchor across every page.
- Place links where they answer the reader’s likely next question.

## Validation Result

- Topic hubs: 6
- Public pages: 18
- Orphan pages: 0
- Maximum crawl depth: 2
- Broken internal links: 0
- Internal links checked: 449
