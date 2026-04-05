import { useState, useEffect } from "react";

const TUMOR_TYPES = [
  { id: "circumscribed", label: "Circumscribed Glioma", code: "GLIO-1", icon: "🧩", color: "#4F46E5" },
  { id: "oligo", label: "Oligodendroglioma", code: "GLIO-2", icon: "🔬", color: "#7C3AED", sub: "IDH-mutant, 1p19q codeleted" },
  { id: "astro", label: "IDH-Mutant Astrocytoma", code: "GLIO-4", icon: "⭐", color: "#6D28D9" },
  { id: "gbm", label: "Glioblastoma", code: "GLIO-10", icon: "🔴", color: "#DC2626" },
  { id: "hgg_other", label: "High-Grade Glioma: Other", code: "GLIO-12", icon: "🟠", color: "#EA580C" },
  { id: "ependymoma", label: "Ependymoma", code: "EPEN-1", icon: "🟣", color: "#9333EA" },
  { id: "medulloblastoma", label: "Adult Medulloblastoma", code: "AMED-1", icon: "🧠", color: "#BE185D" },
  { id: "pcnsl", label: "Primary CNS Lymphoma", code: "PCNS-1", icon: "💜", color: "#7E22CE" },
  { id: "meningioma", label: "Meningioma", code: "MENI-1", icon: "🛡️", color: "#0369A1" },
  { id: "ltd_brain_mets", label: "Limited Brain Metastases", code: "LTD-1", icon: "📍", color: "#B91C1C" },
  { id: "ext_brain_mets", label: "Extensive Brain Metastases", code: "MU-1", icon: "🔻", color: "#991B1B" },
  { id: "leptomeningeal", label: "Leptomeningeal Metastases", code: "LEPT-1", icon: "💧", color: "#0E7490" },
  { id: "spinal_primary", label: "Primary Spinal Cord Tumors", code: "PSCT-1", icon: "🦴", color: "#047857" },
  { id: "spinal_mets", label: "Metastatic Spine Tumors", code: "SPINE-1", icon: "⬇️", color: "#065F46" },
];

const REF = [
  { id: "brain_a", code: "BRAIN-A", title: "Imaging Principles", icon: "🖥️", color: "#0284C7", subs: [
    { t: "MRI Protocol", c: ["Standard: pre-contrast T1, T2, T2-FLAIR, DWI, post-contrast T1 (3 planes/3D)","Thin-slice 1mm 3D T1+contrast for SRS planning within 14 days of SRS","Evaluate renal function before GBCAs; avoid if severe renal insufficiency (NSF risk)","Standardized BTIP recommended per consensus guidelines"] },
    { t: "MR Perfusion", c: ["DSC: most common, provides rCBV; useful for grading + progression vs pseudoprogression","DCE: useful when DSC non-diagnostic; longer acquisition","ASL: no contrast needed; useful for GBCA contraindications; limited availability","Helps differentiate hypervascular tumor from hypovascular treatment changes"] },
    { t: "MR Spectroscopy", c: ["Elevated choline + reduced NAA = high grade; lactate/lipid = necrosis","Can detect 2-hydroxyglutarate (2HG) in IDH-mutant gliomas (select centers)","Not routine — limited in posterior fossa, spine, small/hemorrhagic/cystic lesions","Most useful when other imaging inconclusive"] },
    { t: "PET Imaging", c: ["Amino acid PET (MET, FET, FDOPA): ~90% sens/spec for progression vs treatment changes","Ga-68 DOTATATE PET: high sensitivity for meningiomas; superior to MRI for skull base/postop/recurrent","FDG-PET: limited for brain tumors due to high cortical uptake","PET/MRI preferred when available (lower radiation, better soft tissue)"] },
    { t: "Surveillance — IDH-Mutant Glioma", c: ["Grade 2 Oligo after RT+chemo: q6-9mo; after surgery only: q3-4mo (GTR: q6-9mo after 5y)","Grade 2 Astro after RT+chemo: q6mo; after surgery only: q3-4mo","Grade 3 after RT+chemo: q6-9mo (oligo) or q6mo (astro)","Recurrent: q3-4mo (oligo) or q2-3mo (astro)"] },
    { t: "Surveillance — Other Tumors", c: ["GBM: post-op 48h → pre-RT 3-5w → post-RT 3-6w → q2-3mo×3y → q2-4mo indefinitely","PCNSL & Medulloblastoma: q2-3mo until year 2","Leptomeningeal: q2-3mo×2y → q6mo×5y → annually","Brain mets post-SRS: q2-3mo×1-2y → q4-6mo indefinitely"] },
  ]},
  { id: "brain_b", code: "BRAIN-B", title: "Surgery Principles", icon: "🔪", color: "#059669", subs: [
    { t: "Brain Surgery", c: ["Goals: GTR when appropriate, minimal morbidity, accurate diagnosis","IDH1-mutant: supramarginal resection (enhancing + T2/FLAIR) when safe","Options: GTR, stereotactic biopsy, LITT (2B for poor surgical candidates), carmustine wafer","Post-op MRI within 48h; staging spine MRI pre-op or delayed 2-3 weeks","Adjuncts: intraop microscope, frameless navigation, fMRI/DTI, awake craniotomy, motor/speech mapping, intraop MRI, 5-ALA"] },
    { t: "Spine Surgery", c: ["Guiding: patient selection by prognosis/PS, neural decompression, spinal stabilization","NOMS framework for metastatic spine disease","Options: surgery before RT for mets, preop embolization for vascular tumors (RCC)","Carbon fiber instrumentation for neuroimaging/complex RT cases","Separation surgery useful for spinal metastatic disease","Intraoperative neuromonitoring for select cases; goal discharge to home"] },
  ]},
  { id: "brain_c", code: "BRAIN-C", title: "Radiation Therapy Principles", icon: "☢️", color: "#D97706", subs: [
    { t: "Low-Grade Glioma RT", c: ["GTV: T2-FLAIR + T1 post-contrast; CTV: GTV+1-2cm; PTV: 50-54 Gy/1.8-2.0 Gy fx","Circumscribed gliomas (PA): CTV margin 1cm","Consider proton therapy for good prognosis (grade 2, IDH-mutant, 1p19q codeleted)"] },
    { t: "High-Grade Glioma RT", c: ["Standard: 60 Gy/2.0 Gy fx or 59.4 Gy/1.8 Gy fx","Grade 3/large volume: 54-55.8 Gy/1.8 Gy or 57 Gy/1.9 Gy fx","Boost: initial 46 Gy/2Gy → boost 14 Gy/2Gy","Hypofractionated (poor PS/elderly): 34 Gy/10fx, 40.05 Gy/15fx, or 25 Gy/5fx for frail"] },
    { t: "Reirradiation — Glioma", c: ["Select cases with attention to prior doses, critical structures, interval from prior RT","Techniques: IMRT, proton, SRS for focal; 35 Gy/10fx for recurrent GBM (RTOG 1205)","Lower-grade recurrence with long interval: extended fractionation may be considered"] },
    { t: "Brain Mets — SRS Dosing", c: ["Marginal doses: 15-24 Gy single fraction based on volume","Fractionated SRS (>2cm or V12>10cm³): 27 Gy/3fx or 30 Gy/5fx","Postop SRS: 16-20 Gy/1fx, 24-27 Gy/3fx, or 30 Gy/5fx","Preop SRS: category 2B, may decrease meningeal recurrence","WBRT: 30 Gy/10fx or 20 Gy/5fx; HA-WBRT preferred (mets >5mm from hippocampi, life ≥4mo)","Memantine during+after WBRT for 6 months"] },
    { t: "Reirradiation — Brain Mets", c: ["Rule out radionecrosis first (perfusion, MRS, PET, biopsy)","SRS favored after prior WBRT; repeat SRS: 25-30 Gy/5fx or 24-27 Gy/3fx","For targetable mutations: may defer for CNS-active systemic therapy","Repeat WBRT: 20 Gy/10fx in rare cases; consider memantine + HA","LITT+biopsy may clarify necrosis vs recurrence"] },
    { t: "Ependymoma RT", c: ["Intracranial: CTV (GTV+1-2cm) = 54-59.4 Gy/1.8-2.0 Gy","Craniospinal: 36 Gy/1.8 Gy brain+spine → primary 54-59.4 Gy","Below conus: may receive 54-60 Gy; consider IMRT/protons for CSI"] },
    { t: "Medulloblastoma RT", c: ["Standard risk: CSI 23.4 Gy + boost 54-55.8 Gy (with chemo)","High risk: CSI 36 Gy + boost 54-55.8 Gy; focal spine boost for gross disease","Without chemo: CSI 30-36 Gy + boost; consider IMRT/protons"] },
    { t: "PCNSL RT", c: ["Consolidation after HD-MTX: reduced-dose WBRT 23.4 Gy/1.8 Gy","Definitive: cranial 20-24 Gy → boost to T1/T2 disease 40-50 Gy","Less than CR: WBRT 23.4-36 Gy → boost to 45 Gy; WBRT neurotoxicity risk especially >60y"] },
    { t: "Meningioma RT", c: ["G1: 50-54 Gy; SRS 12-16 Gy/1fx; SRT 25-30 Gy/5fx","G2: 54-60 Gy; recurrence SRS 16-20 Gy/1fx or SRT 27.5-30 Gy/5fx","G3: 59.4-60 Gy; may need 66-70 Gy with SIB; DOTATATE PET for planning"] },
    { t: "Spinal Cord Tumors RT", c: ["Primary: 45-54 Gy/1.8 Gy; below conus up to 60 Gy; CTV 1-2cm sup/inf","Focal SRS/SBRT for hemangioblastoma if appropriate; protons helpful"] },
    { t: "Metastatic Spine RT", c: ["Conventional: 8 Gy/1fx, 20 Gy/5fx, 30 Gy/10fx","SBRT: 16-24 Gy/1fx, 24-30 Gy/3fx, 30-40 Gy/5fx","Single 8 Gy = equivalent pain relief; higher retreatment rates","SBRT preferred for radioresistant histologies (RCC, melanoma, sarcoma)","Retreatment BED≤60 upfront: can retreat as early as 6 weeks"] },
  ]},
  { id: "brain_d", code: "BRAIN-D", title: "Tumor Management", icon: "💊", color: "#7C3AED", subs: [
    { t: "Multidisciplinary Care", c: ["Brain tumor board strongly recommended; team: neuro-oncology, surgery, radiology, allied health","Identify main point of contact early; integrate palliative care early","QOL should guide decisions alongside imaging response","Offer clinical trials; discuss informed consent and side effects","Educate on pseudoprogression and imaging uncertainty"] },
    { t: "Corticosteroids", c: ["Lowest dose, shortest time; BID or daily dexamethasone","AVOID before biopsy if CNS lymphoma suspected","Mass effect: steroids ≥24h before RT; H2/PPI for high-risk GI","PJP prophylaxis for long-term use; monitor adrenal insufficiency when weaning","Side effects: hyperglycemia, skin changes, visual changes, myopathy"] },
    { t: "Edema & Radionecrosis", c: ["Symptomatic: steroids + confirmatory imaging (perfusion, MRS, PET)","If steroids fail: bevacizumab 2-3 doses, reassess q4-6 weeks","Consider hyperbaric oxygen for refractory cases","Asymptomatic: serial MR + neuro exam q2-3 months","LITT option for radiation necrosis (case-by-case)"] },
    { t: "Seizures", c: ["Prophylaxis NOT routine in asymptomatic patients; reasonable perioperatively","Avoid EIAEDs (phenytoin, phenobarbital, carbamazepine) — drug interactions","Use non-EIAEDs: levetiracetam, topiramate, valproic acid, lacosamide","Consult neurology for management"] },
    { t: "VTE, Endocrine, Fatigue, Psych", c: ["VTE: DOACs recommended for high-risk diffuse glioma patients","Endocrine: monitor HPA axis, thyroid, gonads; post-RT long-term monitoring","Fatigue: screen underlying causes; encourage physical exercise","Depression/anxiety: common; screen at follow-up; psychotropics effective","Hearing loss (NF2): bevacizumab for vestibular schwannomas"] },
    { t: "Neurocognitive Function", c: ["Up to 90% of supratentorial tumor patients have some dysfunction","MMSE/MoCA insensitive to executive function, attention, processing speed","Neuropsych evaluation is gold standard; guides accommodations and rehab","Cognitive impairment is sensitive indicator of progression and predictor of OS","Exercise may preserve cognitive function — encourage at diagnosis"] },
  ]},
  { id: "brain_e", code: "BRAIN-E", title: "Molecular Pathology", icon: "🧬", color: "#E11D48", subs: [
    { t: "Integrated Diagnosis", c: ["WHO 2021: integrated histopathologic + molecular classification is standard","3 adult diffuse glioma types: IDH-mutant astrocytoma, Oligo (IDH-mut/1p19q-codel), GBM (IDH-wt)","NGS preferred for pathologic workup; DNA methylation profiling powerful for ambiguous cases","Molecular testing of GBM encouraged — driver mutations expand trial/compassionate use options"] },
    { t: "IDH1/IDH2", c: ["Required for ALL glioma workup","R132H: screened by IHC; if negative + age<55: sequencing of IDH1/IDH2 required","Defines grade 2-4 astrocytomas and oligodendrogliomas; absent in grade 1 and GBM","Associated with MGMT methylation and favorable prognosis","Grade 4 IDH-mutant: if necrosis/microvascular proliferation OR CDKN2A/B homozygous deletion"] },
    { t: "1p/19q Codeletion", c: ["Essential for oligodendroglioma diagnosis (requires BOTH IDH mutation + 1p19q codeletion)","Detection: array-based genomic copy number (preferred) or FISH","True codeletion virtually nonexistent without IDH mutation — skip testing if definitely IDH-wt","IDH-mutant without ATRX loss → strongly consider 1p/19q testing","'Oligoastrocytoma' no longer valid — resolve by molecular testing"] },
    { t: "MGMT Methylation", c: ["Essential for ALL grade 3-4 gliomas","MGMT silencing → tumor more sensitive to TMZ and nitrosoureas","Detection: qMS-PCR (most validated), pyrosequencing (best stratifier), droplet-digital PCR","Particularly useful for elderly HGG treatment decisions","Unmethylated GBM: less benefit from TMZ"] },
    { t: "ATRX / TERT / H3-3A", c: ["ATRX: loss + IDH mutation + TP53 = astrocytoma; mutually exclusive with 1p19q codeletion","TERT promoter: present in most GBMs and 1p19q-codeleted oligos; IDH-wt + TERT = worse survival","H3K27M: diffuse midline gliomas → WHO grade 4 regardless of histology; MGMT typically unmethylated","H3.3 G34V/R: hemispheric, young adults; IDH-wt but ATRX/TP53 mutant → WHO grade 4"] },
    { t: "BRAF", c: ["V600E: 60-80% PXAs, 30% DNETs, 20% gangliogliomas, 5% PAs, <5% GBMs","Fusions: mainly PAs (posterior fossa); detected by RNA sequencing","V600E may respond to BRAF inhibitors (vemurafenib, dabrafenib ± trametinib)","BRAF testing clinically indicated in low-grade glioma"] },
    { t: "Ependymoma / Medulloblastoma / Meningioma", c: ["Ependymoma: PFA vs PFB (H3K27me3 loss by IHC; methylation profiling gold standard); ZFTA fusion; MYCN amplification","Medulloblastoma: 4 subgroups (WNT, SHH±TP53, non-WNT/non-SHH); WNT best prognosis but worse in adults vs children","Classification by DNA methylation arrays or IHC panel (beta-catenin, GAB1, YAP1)","Meningioma: genomic copy number + methylation profiling for recurrent/grade 2-3; CDKN2A/B deletion or TERT mutation → grade 3"] },
  ]},
  { id: "brain_f", code: "BRAIN-F", title: "Cancer Risk Assessment", icon: "🧪", color: "#4338CA", subs: [
    { t: "Genetic Testing", c: ["Consider for: tuberous sclerosis, NF1, NF2, VHL syndrome, Li-Fraumeni, Lynch/FAP","NGS from tumor CANNOT prove heritable predisposition — need germline testing from blood","Referral to medical genetics for suggestive personal/family history"] },
  ]},
  { id: "sys_glio", code: "GLIO-A", title: "Glioma Systemic Therapy", icon: "💉", color: "#4F46E5", subs: [
    { t: "Circumscribed Glioma", c: ["Adjuvant: RT+PCV, RT+TMZ, RT+concurrent/adjuvant TMZ","Recurrent: TMZ, lomustine/carmustine, PCV","BRAF V600E: dabrafenib/trametinib, vemurafenib/cobimetinib; SEGA: everolimus","NTRK fusion: larotrectinib, entrectinib, repotrectinib(2B); BRAF fusion: tovorafenib","NF1 plexiform neurofibromas: mirdametinib, selumetinib (cat 1)"] },
    { t: "Oligodendroglioma", c: ["Grade 2 no residual: vorasidenib (cat 1 for residual); ivosidenib if intolerant","Adjuvant Grade 2: RT+PCV (cat 1), RT+TMZ","Grade 3: RT+neoadjuvant/adjuvant PCV (cat 1), RT+concurrent/adjuvant TMZ","Recurrent: TMZ, lomustine, PCV, bevacizumab ± combinations, vorasidenib, ivosidenib","Progression on preferred: etoposide (2B), carboplatin (cat 3), cisplatin (cat 3)"] },
    { t: "GBM", c: ["Standard: RT+TMZ+TTFields (cat 1, supratentorial only); RT+TMZ (cat 1)","MGMT methylated: concurrent lomustine+TMZ (2B)","Elderly: hypofractionated RT+TMZ (cat 1); TMZ alone; hypofractionated RT alone","Recurrent: bevacizumab, lomustine, TMZ rechallenge, bev+lomustine, carmustine wafer(2B)","Recurrent: regorafenib(2B), etoposide, TTFields(2B)"] },
  ]},
  { id: "sys_mets", code: "BRAIN METS-A", title: "Brain Mets Systemic Therapy", icon: "🎯", color: "#B91C1C", subs: [
    { t: "Breast HER2+", c: ["Preferred: tucatinib+trastuzumab+capecitabine (cat 1); T-DXd (preferred)","Other: neratinib, T-DM1"] },
    { t: "Breast HER2 low", c: ["T-DXd (IHC 1+ or 2+/ISH negative) — useful in certain circumstances"] },
    { t: "NSCLC EGFR+", c: ["Preferred: osimertinib (cat 1); amivantamab+lazertinib; amivantamab+carbo+pemetrexed","Other: osimertinib+platinum-pemetrexed (cat 1)"] },
    { t: "NSCLC ROS1+", c: ["Repotrectinib (new addition)"] },
    { t: "Melanoma", c: ["Ipilimumab+nivolumab; nivolumab alone; BRAF/MEK inhibitors for BRAF-mutant"] },
    { t: "SCLC", c: ["Tarlatamab-dlle (new addition)"] },
  ]},
  { id: "sys_pcnsl", code: "PCNS-A", title: "PCNSL Systemic Therapy", icon: "💜", color: "#7E22CE", subs: [
    { t: "Induction & Consolidation", c: ["Induction: HD-MTX-based (R-MPV, HD-MTX+cytarabine±rituximab, HD-MTX+TMZ±rituximab)","Consolidation: auto HCT (thiotepa-based) if eligible; reduced-dose WBRT if ineligible","Recurrent: HD-MTX rechallenge if ≥1y remission; ibrutinib, lenalidomide±rituximab, TMZ, pemetrexed"] },
  ]},
  { id: "sys_meni", code: "MENI-A", title: "Meningioma Systemic Therapy", icon: "🛡️", color: "#0369A1", subs: [
    { t: "Options", c: ["No preferred agent","Other: sunitinib(2B), bevacizumab","Circumstance: bev+everolimus(2B), somatostatin analogue(2B), somatostatin+everolimus"] },
  ]},
  { id: "sys_lept", code: "LEPT-A", title: "Leptomeningeal Therapy", icon: "💧", color: "#0E7490", subs: [
    { t: "By Primary", c: ["Breast HER2+: T-DXd(preferred), tucatinib+trastuzumab+capecitabine","NSCLC EGFR+: osimertinib double dose","Melanoma: IT+IV nivolumab(2B)","General: IT methotrexate/cytarabine; systemic therapy with CNS penetration"] },
  ]},
  { id: "sys_spine", code: "PSCT-A", title: "Spinal Cord Tumor Therapy", icon: "🦴", color: "#047857", subs: [
    { t: "Options", c: ["NF2 vestibular schwannomas: bevacizumab","VHL hemangioblastomas: belzutifan","NF1 plexiform neurofibromas: mirdametinib or selumetinib (cat 1)"] },
  ]},
  { id: "categories", code: "CAT", title: "NCCN Evidence Categories", icon: "📋", color: "#6B7280", subs: [
    { t: "Categories", c: ["Cat 1: High-level evidence (≥1 RCT/meta-analyses) + ≥85% consensus","Cat 2A: Lower-level evidence + ≥85% consensus (DEFAULT)","Cat 2B: Lower-level evidence + 50-84% consensus","Cat 3: Any evidence + major disagreement","Preferred: superior efficacy/safety/evidence; Other Recommended: less efficacious/more toxic/less data; Useful in Certain Circumstances: selected populations"] },
  ]},
];

const DT: Record<string, { title: string; steps: any[] }> = {
  circumscribed: { title: "Circumscribed Glioma", steps: [
    { id: "r", question: "Maximal safe resection feasible?", options: [{ label: "Yes — GTR", next: "pg" },{ label: "No — STR/Biopsy", next: "ps" }]},
    { id: "pg", question: "Pathology?", options: [{ label: "WHO G1 (PA/Ganglioglioma/DNET) or G2 PXA", next: "g1g" },{ label: "SEGA", next: "sega" },{ label: "Oligodendroglioma", next: "ro" },{ label: "IDH-Mutant Astrocytoma", next: "ra" },{ label: "WHO Grade 3", next: "rh" }]},
    { id: "ps", question: "Pathology?", options: [{ label: "WHO G1/G2 Circumscribed", next: "g1s" },{ label: "SEGA", next: "sega" },{ label: "Oligodendroglioma", next: "ro" },{ label: "IDH-Mutant Astrocytoma", next: "ra" },{ label: "WHO Grade 3", next: "rh" }]},
    { id: "g1g", result: true, title: "Complete Resection — G1/2 Circumscribed", recommendations: [{ text: "No further treatment", category: "preferred" },{ text: "Follow-up MRI per BRAIN-A", category: "followup" }], notes: ["Post-op MRI 48h","H3+BRAF concurrent alterations may be more aggressive"] },
    { id: "g1s", result: true, title: "Incomplete Resection — G1/2 Circumscribed", recommendations: [{ text: "Observation", category: "preferred" },{ text: "RT if significant growth/symptoms", category: "other" },{ text: "BRAF+MEK inhibitors if BRAF V600E", category: "circumstance" }], notes: ["Molecular diagnostics per BRAIN-E"] },
    { id: "sega", result: true, title: "SEGA", recommendations: [{ text: "Test for tuberous sclerosis → genetic counseling", category: "preferred" },{ text: "Everolimus if symptomatic/growing", category: "preferred" }], notes: [] },
    { id: "ro", redirect: "oligo", message: "→ Oligodendroglioma (GLIO-2)" },
    { id: "ra", redirect: "astro", message: "→ IDH-Mutant Astrocytoma (GLIO-4)" },
    { id: "rh", redirect: "gbm", message: "→ High-Grade Glioma (GLIO-9)" },
  ]},
  oligo: { title: "Oligodendroglioma (IDH-mutant, 1p19q codeleted)", steps: [
    { id: "g", question: "WHO grade?", options: [{ label: "Grade 2", next: "g2p" },{ label: "Grade 3", next: "g3p" }]},
    { id: "g2p", question: "KPS?", options: [{ label: "≥60", next: "g2r" },{ label: "<60", next: "g2po" }]},
    { id: "g2r", question: "Residual disease?", options: [{ label: "No residual", next: "g2n" },{ label: "Residual, RT not preferred upfront", next: "g2re" },{ label: "RT+chemo preferred / progression on IDH-i", next: "g2rt" }]},
    { id: "g2n", result: true, title: "G2 Oligo — No Residual, KPS≥60", recommendations: [{ text: "Observation", category: "preferred" },{ text: "Vorasidenib (IDH1/IDH2)", category: "preferred" },{ text: "Clinical trial", category: "other" }], notes: ["INDIGO: PFS 27.7 vs 11.1mo","No-residual excluded from INDIGO","Ivosidenib (IDH1) if vorasidenib intolerant"] },
    { id: "g2re", result: true, title: "G2 Oligo — Residual, RT Not Preferred", recommendations: [{ text: "Vorasidenib (cat 1)", category: "preferred" },{ text: "Observation", category: "other" }], notes: [] },
    { id: "g2rt", result: true, title: "G2 Oligo — RT+Chemo Preferred", recommendations: [{ text: "Clinical trial", category: "preferred" },{ text: "Standard RT + adjuvant PCV (cat 1)", category: "preferred" },{ text: "Standard RT + adjuvant TMZ", category: "other" },{ text: "Standard RT + concurrent/adjuvant TMZ", category: "other" }], notes: ["RTOG 9802: OS improvement with RT+PCV"] },
    { id: "g2po", result: true, title: "G2 Oligo — KPS<60", recommendations: [{ text: "IDH inhibitor (if poor PS from comorbidities)", category: "preferred" },{ text: "RT (hypofractionated) ± TMZ", category: "other" },{ text: "TMZ alone (2B)", category: "circumstance" },{ text: "Palliative care", category: "other" }], notes: ["If KPS<60 from tumor → RT+TMZ preferred"] },
    { id: "g3p", question: "KPS?", options: [{ label: "≥60", next: "g3g" },{ label: "<60", next: "g3po" }]},
    { id: "g3g", result: true, title: "G3 Oligo — KPS≥60", recommendations: [{ text: "Clinical trial", category: "preferred" },{ text: "RT + PCV (cat 1)", category: "preferred" },{ text: "RT + concurrent/adjuvant TMZ", category: "preferred" },{ text: "IDH inhibitor (2B)", category: "circumstance" }], notes: [] },
    { id: "g3po", result: true, title: "G3 Oligo — KPS<60", recommendations: [{ text: "RT (hypofractionated) ± TMZ", category: "other" },{ text: "IDH inhibitor (2B)", category: "circumstance" },{ text: "Palliative care", category: "other" }], notes: [] },
  ]},
  astro: { title: "IDH-Mutant Astrocytoma", steps: [
    { id: "g", question: "WHO grade?", options: [{ label: "Grade 2", next: "g2p" },{ label: "Grade 3", next: "g3p" },{ label: "Grade 4", next: "g4p" }]},
    { id: "g2p", question: "KPS?", options: [{ label: "≥60", next: "g2r" },{ label: "<60", next: "g2po" }]},
    { id: "g2r", question: "Residual?", options: [{ label: "No residual", next: "g2n" },{ label: "Residual, RT not preferred", next: "g2re" },{ label: "RT+chemo preferred", next: "g2rt" }]},
    { id: "g2n", result: true, title: "G2 Astro — No Residual, KPS≥60", recommendations: [{ text: "Observation", category: "preferred" },{ text: "Vorasidenib", category: "preferred" }], notes: [] },
    { id: "g2re", result: true, title: "G2 Astro — Residual, RT Not Preferred", recommendations: [{ text: "Vorasidenib (cat 1)", category: "preferred" },{ text: "Observation", category: "other" }], notes: [] },
    { id: "g2rt", result: true, title: "G2 Astro — RT+Chemo", recommendations: [{ text: "Clinical trial", category: "preferred" },{ text: "RT + adjuvant TMZ (12 cycles)", category: "preferred" },{ text: "RT + concurrent/adjuvant TMZ", category: "preferred" }], notes: [] },
    { id: "g2po", result: true, title: "G2 Astro — KPS<60", recommendations: [{ text: "IDH inhibitor (comorbidities)", category: "preferred" },{ text: "RT ± TMZ", category: "other" },{ text: "Palliative care", category: "other" }], notes: [] },
    { id: "g3p", question: "KPS?", options: [{ label: "≥60", next: "g3g" },{ label: "<60", next: "g3po" }]},
    { id: "g3g", result: true, title: "G3 Astro — KPS≥60", recommendations: [{ text: "Clinical trial", category: "preferred" },{ text: "RT + concurrent/adjuvant TMZ", category: "preferred" },{ text: "IDH inhibitor (2B)", category: "circumstance" }], notes: [] },
    { id: "g3po", result: true, title: "G3 Astro — KPS<60", recommendations: [{ text: "RT ± TMZ", category: "other" },{ text: "IDH inhibitor (2B)", category: "circumstance" },{ text: "Palliative care", category: "other" }], notes: [] },
    { id: "g4p", question: "KPS?", options: [{ label: "≥60", next: "g4g" },{ label: "<60", next: "g4po" }]},
    { id: "g4g", result: true, title: "G4 Astro — KPS≥60", recommendations: [{ text: "Clinical trial", category: "preferred" },{ text: "RT + TMZ ± TTFields (supratentorial)", category: "preferred" }], notes: ["No clear benefit TMZ >6 months"] },
    { id: "g4po", result: true, title: "G4 Astro — KPS<60", recommendations: [{ text: "Hypofractionated RT ± TMZ", category: "preferred" },{ text: "Palliative care", category: "other" }], notes: [] },
  ]},
  gbm: { title: "Glioblastoma", steps: [
    { id: "a", question: "Age & PS?", options: [{ label: "≤70y, KPS≥60", next: "ym" },{ label: ">70y, KPS≥60", next: "om" },{ label: "Any, KPS<60", next: "po" }]},
    { id: "ym", question: "MGMT?", options: [{ label: "Methylated/Indeterminate", next: "ymm" },{ label: "Unmethylated", next: "ymu" }]},
    { id: "ymm", result: true, title: "GBM ≤70y MGMT Methylated", recommendations: [{ text: "Clinical trial", category: "preferred" },{ text: "RT+TMZ+TTFields (cat 1, preferred)", category: "preferred" },{ text: "RT+TMZ (cat 1)", category: "preferred" },{ text: "RT+lomustine+TMZ (2B)", category: "circumstance" }], notes: ["TTFields supratentorial only","No clear TMZ benefit >6mo","Pseudoprogression possible within 3mo"] },
    { id: "ymu", result: true, title: "GBM ≤70y MGMT Unmethylated", recommendations: [{ text: "Clinical trial", category: "preferred" },{ text: "RT+TMZ+TTFields (cat 1)", category: "preferred" },{ text: "RT+TMZ (cat 1)", category: "preferred" },{ text: "RT alone", category: "other" }], notes: ["TMZ benefit likely LOWER"] },
    { id: "om", question: "MGMT?", options: [{ label: "Methylated/Indeterminate", next: "omm" },{ label: "Unmethylated", next: "omu" }]},
    { id: "omm", result: true, title: "GBM >70y MGMT Methylated", recommendations: [{ text: "Hypofractionated RT+TMZ (cat 1)", category: "preferred" },{ text: "RT+TMZ+TTFields (cat 1)", category: "preferred" },{ text: "TMZ alone", category: "other" }], notes: [] },
    { id: "omu", result: true, title: "GBM >70y MGMT Unmethylated", recommendations: [{ text: "Hypofractionated RT+TMZ", category: "preferred" },{ text: "RT+TMZ+TTFields (cat 1)", category: "preferred" },{ text: "Hypofractionated RT alone", category: "other" }], notes: [] },
    { id: "po", result: true, title: "GBM KPS<60", recommendations: [{ text: "Hypofractionated RT alone", category: "preferred" },{ text: "TMZ alone", category: "other" },{ text: "Palliative care", category: "other" }], notes: [] },
  ]},
  hgg_other: { title: "HGG: Other", steps: [
    { id: "m", question: "MGMT?", options: [{ label: "Methylated/Indeterminate", next: "mm" },{ label: "Unmethylated", next: "mu" }]},
    { id: "mm", result: true, title: "Other HGG — MGMT Methylated", recommendations: [{ text: "Clinical trial", category: "preferred" },{ text: "RT + concurrent/adjuvant TMZ", category: "preferred" }], notes: ["Perform NGS"] },
    { id: "mu", result: true, title: "Other HGG — MGMT Unmethylated", recommendations: [{ text: "Clinical trial", category: "preferred" },{ text: "RT alone", category: "preferred" },{ text: "RT+TMZ (2B)", category: "circumstance" }], notes: [] },
  ]},
  meningioma: { title: "Meningioma", steps: [
    { id: "s", question: "Scenario?", options: [{ label: "Newly diagnosed", next: "sx" },{ label: "Recurrent/Progressive", next: "rec" }]},
    { id: "sx", question: "Symptomatic?", options: [{ label: "Asymptomatic ≤3cm", next: "obs" },{ label: "Symptomatic/large/risk factors", next: "act" }]},
    { id: "obs", result: true, title: "Small Asymptomatic Meningioma", recommendations: [{ text: "Observation (preferred)", category: "preferred" }], notes: ["Active treatment if near optic nerve"] },
    { id: "act", question: "Surgery feasible?", options: [{ label: "Yes", next: "sg" },{ label: "No → RT", next: "rt" }]},
    { id: "sg", question: "Postop grade?", options: [{ label: "G1", next: "g1" },{ label: "G2 complete", next: "g2c" },{ label: "G2 incomplete", next: "g2i" },{ label: "G3", next: "g3" }]},
    { id: "g1", result: true, title: "Meningioma G1 Postop", recommendations: [{ text: "Observation", category: "preferred" },{ text: "RT if symptomatic", category: "circumstance" }], notes: [] },
    { id: "g2c", result: true, title: "Meningioma G2 Complete Resection", recommendations: [{ text: "Consider RT", category: "preferred" }], notes: [] },
    { id: "g2i", result: true, title: "Meningioma G2 Incomplete Resection", recommendations: [{ text: "RT", category: "preferred" }], notes: [] },
    { id: "g3", result: true, title: "Meningioma G3 Malignant", recommendations: [{ text: "RT (59.4-60 Gy, may need 66-70 Gy)", category: "preferred" }], notes: ["Margin 1-3cm"] },
    { id: "rt", result: true, title: "Meningioma Not Surgical", recommendations: [{ text: "RT", category: "preferred" }], notes: [] },
    { id: "rec", question: "Surgery feasible?", options: [{ label: "Yes", next: "rs" },{ label: "No, RT OK", next: "rrt" },{ label: "No, RT not OK", next: "rsy" },{ label: "Not indicated", next: "rob" }]},
    { id: "rs", result: true, title: "Recurrent — Surgery", recommendations: [{ text: "Surgery", category: "preferred" },{ text: "RT", category: "other" }], notes: [] },
    { id: "rrt", result: true, title: "Recurrent — RT", recommendations: [{ text: "RT", category: "preferred" }], notes: [] },
    { id: "rsy", result: true, title: "Recurrent — Systemic", recommendations: [{ text: "Sunitinib(2B), bevacizumab, bev+everolimus(2B), somatostatin analogue(2B)", category: "other" }], notes: [] },
    { id: "rob", result: true, title: "Recurrent — Observe", recommendations: [{ text: "Observation", category: "preferred" }], notes: [] },
  ]},
  ltd_brain_mets: { title: "Limited Brain Mets", steps: [
    { id: "s", question: "Systemic status?", options: [{ label: "Stable/options available", next: "a" },{ label: "Disseminated/poor options", next: "p" }]},
    { id: "a", result: true, title: "Limited Mets — Good Options", recommendations: [{ text: "SRS (preferred)", category: "preferred" },{ text: "Surgery for mass effect → SRS", category: "preferred" },{ text: "Systemic therapy with CNS penetration (select)", category: "other" },{ text: "HA-WBRT + memantine", category: "other" }], notes: ["SRS+WBRT NOT recommended","HA-WBRT: mets >5mm from hippocampi, life ≥4mo","MRI q2-3mo×1-2y then q4-6mo"] },
    { id: "p", result: true, title: "Limited Mets — Poor Options", recommendations: [{ text: "HA-WBRT + memantine", category: "preferred" },{ text: "SRS", category: "other" },{ text: "Palliative care", category: "other" }], notes: [] },
  ]},
  ext_brain_mets: { title: "Extensive Brain Mets", steps: [
    { id: "s", question: "Systemic status?", options: [{ label: "Active options", next: "a" },{ label: "Poor options", next: "p" }]},
    { id: "a", result: true, title: "Extensive Mets — Active", recommendations: [{ text: "HA-WBRT + memantine (preferred)", category: "preferred" },{ text: "Surgery for mass effect", category: "other" },{ text: "SRS in select patients", category: "circumstance" }], notes: [] },
    { id: "p", result: true, title: "Extensive Mets — Poor Options", recommendations: [{ text: "HA-WBRT + memantine", category: "preferred" },{ text: "Palliative care", category: "other" }], notes: [] },
  ]},
  ependymoma: { title: "Ependymoma", steps: [
    { id: "l", question: "Location?", options: [{ label: "Intracranial", next: "ic" },{ label: "Spinal", next: "sp" }]},
    { id: "ic", question: "Resection?", options: [{ label: "GTR", next: "icg" },{ label: "STR", next: "ics" }]},
    { id: "icg", question: "Grade?", options: [{ label: "G2", next: "ig2" },{ label: "G3", next: "ig3" }]},
    { id: "ig2", result: true, title: "IC Ependymoma G2 GTR", recommendations: [{ text: "Observation", category: "preferred" },{ text: "Consider RT", category: "other" }], notes: [] },
    { id: "ig3", result: true, title: "IC Ependymoma G3 GTR", recommendations: [{ text: "RT to tumor bed", category: "preferred" }], notes: [] },
    { id: "ics", result: true, title: "IC Ependymoma STR", recommendations: [{ text: "Re-resection if feasible", category: "preferred" },{ text: "RT", category: "preferred" }], notes: [] },
    { id: "sp", result: true, title: "Spinal Ependymoma", recommendations: [{ text: "Max safe resection → complete: observe", category: "preferred" },{ text: "Incomplete: consider RT", category: "other" },{ text: "Myxopapillary: consider RT even after GTR", category: "circumstance" }], notes: [] },
  ]},
  medulloblastoma: { title: "Adult Medulloblastoma", steps: [
    { id: "r", question: "Risk?", options: [{ label: "Standard (GTR, no CSF dissemination)", next: "sr" },{ label: "High (residual≥1.5cm² and/or CSF+)", next: "hr" }]},
    { id: "sr", result: true, title: "Standard Risk", recommendations: [{ text: "CSI 23.4 Gy + boost 54-55.8 Gy", category: "preferred" },{ text: "Concurrent vincristine + post-RT Packer regimen", category: "preferred" }], notes: ["Molecular subtyping recommended","Collect stem cells before CSI"] },
    { id: "hr", result: true, title: "High Risk", recommendations: [{ text: "CSI 36 Gy + boost 54-55.8 Gy", category: "preferred" },{ text: "Concurrent vincristine + post-RT chemo", category: "preferred" },{ text: "HD chemo + auto SCR (2B)", category: "circumstance" }], notes: [] },
  ]},
  pcnsl: { title: "Primary CNS Lymphoma", steps: [
    { id: "d", question: "Diagnosis?", options: [{ label: "Positive — Brain", next: "br" },{ label: "Positive — Ocular", next: "ey" },{ label: "Non-diagnostic, high suspicion", next: "nd" }]},
    { id: "br", result: true, title: "PCNSL Brain", recommendations: [{ text: "HD-MTX-based induction (R-MPV)", category: "preferred" },{ text: "Consolidation: auto HCT or reduced-dose WBRT", category: "preferred" },{ text: "WBRT alone if not chemo candidate", category: "circumstance" }], notes: ["Avoid steroids before biopsy","WBRT neurotoxicity >60y","Slit lamp + CSF + spine MRI for staging"] },
    { id: "ey", result: true, title: "PCNSL Ocular", recommendations: [{ text: "Multidisciplinary consult", category: "preferred" },{ text: "Intraocular therapy", category: "preferred" }], notes: [] },
    { id: "nd", result: true, title: "Non-Diagnostic Biopsy", recommendations: [{ text: "Repeat biopsy", category: "preferred" },{ text: "Short-interval MRI", category: "other" }], notes: [] },
  ]},
  leptomeningeal: { title: "Leptomeningeal Mets", steps: [
    { id: "t", question: "Primary?", options: [{ label: "Solid tumor", next: "so" },{ label: "Hematologic", next: "he" }]},
    { id: "so", result: true, title: "Leptomeningeal — Solid", recommendations: [{ text: "MRI neuraxis BEFORE LP", category: "preferred" },{ text: "CSF: count, diff, glucose, protein, cytopathology, ± ctDNA", category: "preferred" },{ text: "RT to symptomatic/bulky sites", category: "preferred" },{ text: "Systemic therapy with CNS penetration", category: "other" },{ text: "IT chemo", category: "circumstance" }], notes: ["LP after spine MRI","HER2+: T-DXd; EGFR+: osimertinib 2x; melanoma: IT+IV nivo(2B)"] },
    { id: "he", result: true, title: "Leptomeningeal — Hematologic", recommendations: [{ text: "CSF flow cytometry + ctDNA", category: "preferred" },{ text: "IT chemo (MTX/cytarabine)", category: "preferred" }], notes: [] },
  ]},
  spinal_primary: { title: "Primary Spinal Cord Tumors", steps: [
    { id: "c", question: "Compartment?", options: [{ label: "Intramedullary — Circumscribed", next: "ci" },{ label: "Intramedullary — Infiltrative", next: "in" },{ label: "Extramedullary", next: "ex" }]},
    { id: "ci", question: "Pathology?", options: [{ label: "Ependymoma", next: "re" },{ label: "PA/Hemangioblastoma", next: "pa" }]},
    { id: "pa", result: true, title: "Spinal PA/Hemangioblastoma", recommendations: [{ text: "Complete resection → Observe", category: "preferred" },{ text: "Symptomatic → RT", category: "other" },{ text: "VHL screening; belzutifan for VHL hemangioblastomas", category: "circumstance" }], notes: [] },
    { id: "re", redirect: "ependymoma", message: "→ Ependymoma" },
    { id: "in", question: "Grade?", options: [{ label: "Low", next: "rl" },{ label: "High", next: "rh" }]},
    { id: "rl", redirect: "circumscribed", message: "→ Low-Grade Glioma" },
    { id: "rh", redirect: "gbm", message: "→ High-Grade Glioma" },
    { id: "ex", result: true, title: "Extramedullary", recommendations: [{ text: "Asymptomatic → Observe", category: "preferred" },{ text: "Symptomatic → Max safe resection", category: "preferred" },{ text: "Multiple → Consider NF1/NF2/schwannomatosis", category: "other" },{ text: "NF1 PN: mirdametinib/selumetinib (cat 1)", category: "circumstance" }], notes: [] },
  ]},
  spinal_mets: { title: "Metastatic Spine", steps: [
    { id: "s", question: "Stability?", options: [{ label: "Stable, mild/no deficit", next: "st" },{ label: "Unstable or significant deficit", next: "un" }]},
    { id: "st", result: true, title: "Stable Spine Mets", recommendations: [{ text: "Conventional RT or SBRT (preferred for radioresistant)", category: "preferred" },{ text: "Systemic therapy", category: "other" }], notes: ["Single 8Gy = equivalent pain relief, higher retreatment","SBRT preferred ≥3mo life expectancy"] },
    { id: "un", result: true, title: "Unstable Spine / Deficit", recommendations: [{ text: "Surgical consult + post-op RT", category: "preferred" },{ text: "Steroids for acute cord compression", category: "preferred" },{ text: "RT alone if not surgical", category: "other" }], notes: ["Separation surgery + SBRT for radioresistant histologies"] },
  ]},
};

const cc: Record<string, { bg: string; border: string; text: string; label: string }> = {
  preferred: { bg: "#DBEAFE", border: "#3B82F6", text: "#1E40AF", label: "Preferred" },
  other: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E", label: "Other Recommended" },
  circumstance: { bg: "#E0E7FF", border: "#818CF8", text: "#4338CA", label: "Useful in Certain Circumstances" },
  followup: { bg: "#D1FAE5", border: "#34D399", text: "#065F46", label: "Follow-up" },
};

function RC({ rec }: { rec: { category: string; text: string } }) {
  const c = cc[rec.category] || cc.other;
  return (
    <div style={{ padding: "10px 14px", borderLeft: `4px solid ${c.border}`, backgroundColor: c.bg, borderRadius: "0 8px 8px 0", marginBottom: "5px" }}>
      <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" as const, color: c.text, backgroundColor: `${c.border}22`, padding: "1px 6px", borderRadius: "3px" }}>{c.label}</span>
      <p style={{ margin: "3px 0 0", fontSize: "13px", lineHeight: 1.4, color: "#1F2937" }}>{rec.text}</p>
    </div>
  );
}

function DecTool({ tid, onBack }: { tid: string; onBack: () => void }) {
  const tumor = TUMOR_TYPES.find(t => t.id === tid);
  const [hist, setHist] = useState<string[]>([]);
  const [cur, setCur] = useState(tid);

  const ct = DT[cur];
  useEffect(() => { if (ct) setHist([ct.steps[0].id]); }, [cur]);

  const step = ct?.steps.find((s: any) => s.id === hist[hist.length - 1]);
  if (!step) return null;

  const back = () => hist.length > 1 ? setHist(h => h.slice(0, -1)) : onBack();

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", paddingBottom: "10px", borderBottom: "1px solid #E5E7EB" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6B7280" }}>←</button>
        <span style={{ fontSize: "18px" }}>{tumor?.icon}</span>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>{ct?.title}</h2>
          <span style={{ fontSize: "10px", color: "#9CA3AF" }}>{tumor?.code}</span>
        </div>
      </div>

      {step.result ? (
        <div>
          <div style={{ backgroundColor: tumor?.color, color: "white", padding: "14px", borderRadius: "10px", marginBottom: "12px" }}>
            <p style={{ fontSize: "10px", textTransform: "uppercase" as const, letterSpacing: "0.06em", opacity: 0.8, margin: "0 0 2px" }}>Recommendation</p>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, lineHeight: 1.3 }}>{step.title}</h3>
          </div>
          {step.recommendations.map((r: any, i: number) => <RC key={i} rec={r} />)}
          {step.notes?.length > 0 && (
            <div style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "10px", margin: "10px 0" }}>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, color: "#6B7280", margin: "0 0 4px" }}>Notes</p>
              {step.notes.map((n: string, i: number) => (
                <p key={i} style={{ fontSize: "12px", color: "#374151", margin: "0 0 3px", lineHeight: 1.4, paddingLeft: "8px", borderLeft: "2px solid #D1D5DB" }}>{n}</p>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={back} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB", backgroundColor: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>← Back</button>
            <button onClick={() => { setCur(tid); setHist([]); }} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: tumor?.color, color: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>New</button>
          </div>
        </div>
      ) : step.redirect ? (
        <div style={{ textAlign: "center" as const, padding: "24px 16px" }}>
          <p style={{ fontSize: "15px", marginBottom: "14px" }}>{step.message}</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={back} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #D1D5DB", backgroundColor: "white", cursor: "pointer", fontSize: "13px" }}>← Back</button>
            <button onClick={() => setCur(step.redirect)} style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "#4F46E5", color: "white", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>Go →</button>
          </div>
        </div>
      ) : (
        <div>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111827", marginBottom: "10px", lineHeight: 1.3 }}>{step.question}</h3>
          {step.options.map((o: any, i: number) => (
            <button key={i} onClick={() => setHist(h => [...h, o.next])} style={{ display: "block", width: "100%", padding: "11px 13px", marginBottom: "6px", borderRadius: "8px", border: `2px solid ${tumor?.color}15`, backgroundColor: "white", cursor: "pointer", textAlign: "left" as const, fontSize: "13px", lineHeight: 1.4, color: "#1F2937", fontWeight: 500 }}>{o.label}</button>
          ))}
          {hist.length > 1 && <button onClick={back} style={{ marginTop: "6px", padding: "8px", borderRadius: "8px", border: "1px solid #D1D5DB", backgroundColor: "white", cursor: "pointer", fontSize: "13px", color: "#6B7280", width: "100%" }}>← Back</button>}
        </div>
      )}
    </div>
  );
}

function RefView({ sec, onBack }: { sec: any; onBack: () => void }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", paddingBottom: "10px", borderBottom: "1px solid #E5E7EB" }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#6B7280" }}>←</button>
        <span style={{ fontSize: "18px" }}>{sec.icon}</span>
        <div>
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700 }}>{sec.title}</h2>
          <span style={{ fontSize: "10px", color: "#9CA3AF" }}>{sec.code}</span>
        </div>
      </div>
      {sec.subs.map((s: any, i: number) => (
        <div key={i} style={{ marginBottom: "5px" }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "11px 13px", borderRadius: "8px", border: "none", backgroundColor: open === i ? `${sec.color}10` : "white", cursor: "pointer", textAlign: "left" as const, fontSize: "13px", fontWeight: 600, color: "#111827", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
            {s.t}
            <span style={{ fontSize: "11px", color: "#9CA3AF", transform: open === i ? "rotate(180deg)" : "none", transition: "0.2s" }}>▼</span>
          </button>
          {open === i && (
            <div style={{ padding: "8px 12px", backgroundColor: "#F9FAFB", borderRadius: "0 0 8px 8px", marginTop: "-1px" }}>
              {s.c.map((c: string, j: number) => (
                <p key={j} style={{ fontSize: "12px", color: "#374151", margin: "0 0 5px", lineHeight: 1.45, paddingLeft: "8px", borderLeft: `2px solid ${sec.color}40` }}>{c}</p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("pathways");
  const [selT, setSelT] = useState<string | null>(null);
  const [selR, setSelR] = useState<any>(null);
  const [q, setQ] = useState("");

  const cats = [
    { label: "Gliomas", ids: ["circumscribed","oligo","astro","gbm","hgg_other"] },
    { label: "Other Primary", ids: ["ependymoma","medulloblastoma","pcnsl","meningioma"] },
    { label: "Metastatic", ids: ["ltd_brain_mets","ext_brain_mets","leptomeningeal","spinal_primary","spinal_mets"] },
  ];
  const ft = TUMOR_TYPES.filter(t => t.label.toLowerCase().includes(q.toLowerCase()) || t.code.toLowerCase().includes(q.toLowerCase()));
  const fr = REF.filter(r => r.title.toLowerCase().includes(q.toLowerCase()) || r.code.toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", fontFamily: "'SF Pro Text',-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <style>{`@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} *{box-sizing:border-box} :root{color-scheme:light} html,body{background:#F8FAFC!important}`}</style>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "14px 12px 80px" }}>
        {selT ? (
          <div style={{ animation: "fi 0.2s" }}><DecTool tid={selT} onBack={() => setSelT(null)} /></div>
        ) : selR ? (
          <div style={{ animation: "fi 0.2s" }}><RefView sec={selR} onBack={() => setSelR(null)} /></div>
        ) : (
          <div style={{ animation: "fi 0.2s" }}>
            <div style={{ textAlign: "center" as const, marginBottom: "14px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "46px", height: "46px", borderRadius: "13px", background: "linear-gradient(135deg,#4F46E5,#7C3AED)", marginBottom: "6px" }}>
                <span style={{ fontSize: "22px" }}>🧠</span>
              </div>
              <h1 style={{ fontSize: "19px", fontWeight: 800, color: "#111827", margin: "0 0 1px" }}>NCCN CNS Cancers</h1>
              <p style={{ fontSize: "11px", color: "#6B7280", margin: 0 }}>Complete Clinical Decision Tool • v3.2025</p>
            </div>

            <div style={{ display: "flex", gap: "3px", marginBottom: "12px", backgroundColor: "#E5E7EB", borderRadius: "7px", padding: "3px" }}>
              {[{ id: "pathways", l: "Decision Pathways" },{ id: "reference", l: "Reference Library" }].map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); setQ(""); }} style={{ flex: 1, padding: "7px", borderRadius: "5px", border: "none", fontSize: "12px", fontWeight: 600, backgroundColor: tab === t.id ? "white" : "transparent", color: tab === t.id ? "#111827" : "#6B7280", cursor: "pointer", boxShadow: tab === t.id ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>{t.l}</button>
              ))}
            </div>

            <div style={{ position: "relative" as const, marginBottom: "12px" }}>
              <input type="text" placeholder={tab === "pathways" ? "Search tumor..." : "Search reference..."} value={q} onChange={e => setQ(e.target.value)} style={{ width: "100%", padding: "9px 13px 9px 34px", borderRadius: "8px", border: "1px solid #D1D5DB", fontSize: "13px", outline: "none", backgroundColor: "white" }} />
              <span style={{ position: "absolute" as const, left: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "13px", color: "#9CA3AF" }}>🔍</span>
            </div>

            {tab === "pathways" ? (
              cats.map((cat, ci) => {
                const ts = ft.filter(t => cat.ids.includes(t.id));
                if (!ts.length) return null;
                return (
                  <div key={ci} style={{ marginBottom: "14px" }}>
                    <h3 style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.06em", color: "#9CA3AF", margin: "0 0 5px 2px" }}>{cat.label}</h3>
                    {ts.map(t => (
                      <button key={t.id} onClick={() => setSelT(t.id)} style={{ display: "flex", alignItems: "center", gap: "9px", width: "100%", padding: "11px 12px", marginBottom: "3px", borderRadius: "8px", border: "none", backgroundColor: "white", cursor: "pointer", textAlign: "left" as const, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: `${t.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", flexShrink: 0 }}>{t.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#111827" }}>{t.label}</p>
                          {"sub" in t && t.sub && <p style={{ margin: "1px 0 0", fontSize: "10px", color: "#9CA3AF" }}>{t.sub}</p>}
                        </div>
                        <span style={{ fontSize: "9px", fontWeight: 600, color: t.color, backgroundColor: `${t.color}10`, padding: "2px 5px", borderRadius: "3px", flexShrink: 0 }}>{t.code}</span>
                      </button>
                    ))}
                  </div>
                );
              })
            ) : (
              fr.map(ref => (
                <button key={ref.id} onClick={() => setSelR(ref)} style={{ display: "flex", alignItems: "center", gap: "9px", width: "100%", padding: "11px 12px", marginBottom: "3px", borderRadius: "8px", border: "none", backgroundColor: "white", cursor: "pointer", textAlign: "left" as const, boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "8px", backgroundColor: `${ref.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", flexShrink: 0 }}>{ref.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "#111827" }}>{ref.title}</p>
                    <p style={{ margin: "1px 0 0", fontSize: "10px", color: "#9CA3AF" }}>{ref.subs.length} sections</p>
                  </div>
                  <span style={{ fontSize: "9px", fontWeight: 600, color: ref.color, backgroundColor: `${ref.color}10`, padding: "2px 5px", borderRadius: "3px" }}>{ref.code}</span>
                </button>
              ))
            )}

            <div style={{ textAlign: "center" as const, marginTop: "20px", padding: "10px" }}>
              <p style={{ fontSize: "9px", color: "#D1D5DB", margin: 0, lineHeight: 1.5 }}>NCCN CNS Cancers v3.2025 • For educational/clinical reference use only • Not a substitute for professional medical judgment</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
