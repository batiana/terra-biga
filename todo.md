# Terra Biga — Project TODO

## Phase 1: Foundation
- [x] Database schema (users, products, groups, orders, identities, cagnottes, contributions, donations, points, payments, notifications, admin config)
- [x] Global styles: Terra Biga color palette, Inter font, mobile-first CSS variables
- [x] Shared UI components (Button, Card, ProgressBar, Badge, Modal, Tabs, FileUpload, LanguageSwitcher)
- [ ] Internationalization setup (FR/EN with Mooré/Dioula preparation)

## Phase 2: Homepage
- [x] Sticky header with navigation (Accueil, Te Raga, Ma Cagnotte, Don BIGA CONNECT, Connexion)
- [x] Hero section with dual CTA (Te Raga + Ma Cagnotte)
- [x] Key figures section (animated counters)
- [x] Te Raga section — "Acheter ensemble facilement"
- [x] Ma Cagnotte section — "Cotiser ensemble facilement"
- [x] "Comment ça marche" section with tabs
- [x] Testimonials carousel
- [x] Mobile Payment section (USSD + Ligidicash)
- [x] Final CTA banner
- [x] Footer with links and mentions

## Phase 3: Te Raga Module
- [x] Catalogue page (/te-raga) with category filters
- [x] Product card component with group progress bar
- [x] Product detail page (/te-raga/:productId)
- [x] Join group page (/te-raga/groupe/:groupId)
- [x] Identity form page (/te-raga/identite) with document upload
- [x] Payment page (/te-raga/paiement) with USSD + Ligidicash
- [x] Confirmation page (/te-raga/confirmation)

## Phase 4: Ma Cagnotte Module
- [x] Cagnotte list page (/ma-cagnotte) with public active cagnottes
- [x] Create cagnotte wizard (/ma-cagnotte/creer) — 3-step process
- [x] Cagnotte detail page (/ma-cagnotte/:cagnotteId)
- [x] Contribute page (/ma-cagnotte/contribuer/:cagnotteId)
- [x] Contribution confirmation

## Phase 5: Additional Modules
- [x] Don BIGA CONNECT page (/don-biga-connect)
- [x] BIGA Points system (actions, levels Bronze/Argent/Or/Platine)
- [x] User profile page (/profil) with order history, contributions, points
- [ ] Phone number OTP authentication flow (uses Manus OAuth as fallback)

## Phase 6: Admin Panel
- [x] Admin dashboard with statistics
- [x] Admin orders management
- [x] Admin cagnottes management
- [x] Admin identity verification
- [x] Admin payments tracking
- [x] Admin users management
- [x] Admin donations tracking
- [x] Admin statistics/KPIs

## Phase 7: Backend & Integration
- [x] tRPC routers: auth, products, groups, orders, identity, cagnottes, contributions, donations, points, admin
- [x] Payment integration stubs (USSD Orange/Moov + Ligidicash)
- [x] SMS notification stubs
- [ ] Orange Max it API endpoints
- [x] Seed data (2 products, demo groups, demo cagnottes)

## Phase 8: Testing & Polish
- [x] Vitest unit tests for key routers (8 tests passing)
- [x] Mobile responsiveness verification
- [x] Final checkpoint and delivery

## Phase 9: Partage réseaux sociaux pour cagnottes
- [x] Composant ShareModal réutilisable (WhatsApp, Facebook, Twitter/X, Telegram, copie de lien)
- [x] Bouton de partage sur la page détail cagnotte (/ma-cagnotte/:id)
- [x] Bouton de partage sur la page confirmation de contribution
- [x] Bouton de partage rapide sur les cartes cagnotte (liste)
- [x] Meta tags Open Graph dynamiques pour les cagnottes (titre, description, image)
- [x] API backend pour générer les données OG par cagnotte
- [x] Tests vitest pour la route OG
