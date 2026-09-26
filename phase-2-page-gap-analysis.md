# TutorServices Phase 2 Page Gap Analysis

## Audit Summary

- Audited 95 HTML routes after implementation; the starting inventory contained 82 routes.
- Existing strengths: class-wise tuition, CBSE/ICSE/State Board tuition, core subjects, Delhi locality coverage, home tuition, online tuition, one-to-one tuition, trust policies and enquiry forms.
- Primary commercial gaps: tutor-near-me discovery, tuition-fee guidance, and official city hubs for Gurugram, Noida, Ghaziabad and Faridabad.
- A full link audit found 93 references to missing subject, class and guide routes. Seven distinct subject pages were justified and obsolete aliases were normalised to eliminate those broken links.

## Implementation Decisions

### Create now

1. `/tutors-near-me`
2. `/home-tuition-fees`
3. `/cities/gurugram`
4. `/cities/noida`
5. `/cities/ghaziabad`
6. `/cities/faridabad`
7. `/subjects/accountancy-tuition`
8. `/subjects/economics-tuition`
9. `/subjects/business-studies-tuition`
10. `/subjects/computer-science-tuition`
11. `/subjects/hindi-tuition`
12. `/subjects/social-science-tuition`
13. `/subjects/coding-for-kids`

### Improve existing pages

- `/home-tuition`: connect private tutor, tuition teacher, hiring, fee and nearby-tutor intent.
- `/cities`: add the four supported NCR city hubs.
- `/services`: connect service discovery to tutor-near-me and fee guidance.
- `/subjects`: connect seven previously unserved subject cards to full landing pages and update ItemList schema URLs.
- Existing class, board, city and service pages: replace obsolete internal aliases with canonical destinations.

### Do not create

- Separate pages for find, hire, book, teacher, and near-me variants of the same service.
- Automatic Class x Subject x Board x Location combinations.
- Locality pages without useful locality-specific information.
- Standalone IGCSE, IB or NIOS pages in this phase.

## Search Intent Architecture

- Service intent flows to `/home-tuition`, `/online-tuition`, `/one-to-one-tuition` and `/tutors-near-me`.
- Price intent flows to `/home-tuition-fees`.
- Location intent flows from `/cities` to city hubs, then to relevant service, class, subject, board and registration pages.
- Subject intent flows from `/subjects` to dedicated academic and skill pages, then to class, board, location, fee and tutor-request resources.
- Informational guides link back to the commercial service most relevant to the reader next action.

## Safety Rules Applied

- Existing indexed routes and canonicals remain unchanged.
- New pages receive one H1, unique metadata, self-canonical URLs, visible breadcrumbs matching BreadcrumbList schema, Service/WebPage schema and concise FAQ schema.
- No physical office, guaranteed availability, fixed price, ranking promise, invented review or outcome claim is added.
- New pages use existing CSS, fonts, scripts, navigation, footer and enquiry routes.
