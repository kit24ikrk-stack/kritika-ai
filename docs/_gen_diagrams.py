# Writes all Mermaid (.mmd) diagram sources for the AI-Solutions documentation.
import os

OUT = os.path.join(os.path.dirname(__file__), "diagrams")
os.makedirs(OUT, exist_ok=True)

diagrams = {}

# 1. Use Case Diagram
diagrams["01_usecase"] = """
graph LR
  Visitor([Website Visitor])
  Admin([Administrator])
  subgraph System["AI-Solutions Web System"]
    UC1(("Browse 8 Pages"))
    UC2(("Submit Contact Inquiry"))
    UC3(("Use AI Chatbot"))
    UC4(("View Case Studies"))
    UC5(("Read Feedback & Ratings"))
    UC6(("Admin Login"))
    UC7(("View Dashboard"))
    UC8(("Manage Inquiry Status"))
    UC9(("Logout"))
  end
  Visitor --> UC1
  Visitor --> UC2
  Visitor --> UC3
  Visitor --> UC4
  Visitor --> UC5
  Admin --> UC6
  Admin --> UC7
  Admin --> UC8
  Admin --> UC9
  UC7 -. includes .-> UC6
  UC8 -. includes .-> UC6
"""

# 2. High-level 3-tier Architecture
diagrams["02_architecture"] = """
graph TB
  subgraph Client["PRESENTATION TIER (Client Browser)"]
    B["HTML / CSS / Vanilla JS"]
    CB["AI Chatbot Widget (chat.js)"]
  end
  subgraph App["APPLICATION TIER (Node.js + Express)"]
    EX["Express App (server.js)"]
    MW["Session &amp; requireAdmin Middleware"]
    RT["Route Handlers"]
    EJS["EJS Template Engine"]
  end
  subgraph DataT["DATA TIER"]
    DAL["Data Access Layer (db.js)"]
    SQL[("SQLite (database.sqlite)")]
  end
  B <-->|HTTP request / response| EX
  CB -. runs inside .- B
  EX --> MW
  MW --> RT
  RT --> EJS
  EJS -->|rendered HTML| B
  RT --> DAL
  DAL -->|parameterised SQL| SQL
"""

# 3. Component Diagram
diagrams["03_component"] = """
graph TB
  SRV["Express Server (server.js)"]
  AUTH["requireAdmin Middleware"]
  DAL["db.js (Data Access Layer)"]
  DB[("SQLite")]
  subgraph PublicR["Public Components"]
    P1["Home"]
    P2["Solutions"]
    P3["Case Studies"]
    P4["Feedback"]
    P5["Articles"]
    P6["Gallery"]
    P7["Contact Form"]
    CHAT["Chatbot FAQ Engine"]
  end
  subgraph AdminR["Admin Components"]
    A1["Login"]
    A2["Dashboard"]
    A3["Inquiry Detail"]
    A4["Logout"]
  end
  SRV --> P1
  SRV --> P2
  SRV --> P3
  SRV --> P4
  SRV --> P5
  SRV --> P6
  SRV --> P7
  SRV --> CHAT
  SRV --> A1
  SRV --> A4
  SRV --> AUTH
  AUTH --> A2
  AUTH --> A3
  P7 --> DAL
  P4 --> DAL
  A1 --> DAL
  A2 --> DAL
  A3 --> DAL
  DAL --> DB
"""

# 4. Deployment Diagram
diagrams["04_deployment"] = """
graph TB
  USER["Client Device<br/>(Browser)"]
  subgraph Host["Host Machine (Windows / localhost)"]
    subgraph Node["Node.js Runtime :3000"]
      APP["Express Application"]
      SESS["In-Memory Session Store"]
    end
    STATIC["/public (CSS, JS, images)"]
    FILE[("database.sqlite (file)")]
  end
  USER -->|HTTP :3000| APP
  APP --> SESS
  APP --> STATIC
  APP --> FILE
"""

# 5. Entity Relationship Diagram
diagrams["05_er"] = """
erDiagram
  INQUIRIES {
    INTEGER id PK
    TEXT name
    TEXT email
    TEXT phone
    TEXT company
    TEXT country
    TEXT job_title
    TEXT job_details
    TEXT status
    TEXT assigned_to
    DATETIME created_at
  }
  ADMINS {
    INTEGER id PK
    TEXT username UK
    TEXT password
    DATETIME created_at
  }
  REVIEWS {
    INTEGER id PK
    TEXT name
    TEXT role
    INTEGER rating
    TEXT comment
    DATETIME created_at
  }
  ADMINS ||--o{ INQUIRIES : "manages (logical)"
  ADMINS ||--o{ REVIEWS : "moderates (logical)"
"""

# 6. Site Map / Navigation
diagrams["06_sitemap"] = """
graph TD
  ROOT["Home (/)"]
  ROOT --> S["Solutions (/solutions)"]
  ROOT --> C["Case Studies (/cases)"]
  C --> CD["Case Detail (/cases/:id)"]
  ROOT --> F["Feedback (/feedback)"]
  ROOT --> AR["Articles (/articles)"]
  ROOT --> G["Gallery (/gallery)"]
  ROOT --> CO["Contact Us (/contact)"]
  ROOT --> AL["Admin Login (/admin/login)"]
  AL --> AD["Admin Dashboard (/admin/dashboard)"]
  AD --> AID["Inquiry Detail (/admin/inquiries/:id)"]
  AD --> LO["Logout (/admin/logout)"]
  classDef admin fill:#0b3d5c,color:#fff;
  class AL,AD,AID,LO admin;
"""

# 7. DFD Level 0 (Context)
diagrams["07_dfd_context"] = """
graph LR
  V(["Visitor"])
  A(["Administrator"])
  SYS(("0. AI-Solutions<br/>Web System"))
  DB[("Database Store")]
  V -->|"inquiry details, chat messages"| SYS
  SYS -->|"web pages, chat replies"| V
  A -->|"credentials, status updates"| SYS
  SYS -->|"dashboard data, inquiry list"| A
  SYS -->|"read / write"| DB
  DB -->|"stored records"| SYS
"""

# 8. DFD Level 1
diagrams["08_dfd_level1"] = """
graph TB
  V(["Visitor"])
  A(["Administrator"])
  P1["1.0 Serve Public Pages"]
  P2["2.0 Process Inquiry"]
  P3["3.0 Authenticate Admin"]
  P4["4.0 Manage Dashboard"]
  P5["5.0 Generate Chatbot Reply"]
  D1[("D1 inquiries")]
  D2[("D2 admins")]
  D3[("D3 reviews")]
  V --> P1
  P1 --> D3
  V -->|"form data"| P2
  P2 -->|"INSERT"| D1
  V -->|"message"| P5
  P5 -->|"reply"| V
  A -->|"login"| P3
  P3 -->|"verify hash"| D2
  P3 -->|"valid session"| P4
  P4 -->|"SELECT"| D1
  P4 -->|"UPDATE status"| D1
  P4 -->|"dashboard"| A
"""

# 9. Sequence: Contact form submission
diagrams["09_seq_contact"] = """
sequenceDiagram
  actor U as Visitor
  participant B as Browser
  participant S as Express POST /contact
  participant DB as SQLite (inquiries)
  U->>B: Fill 7-field form and submit
  B->>S: POST form data
  S->>S: Server-side validation (all 7 fields)
  alt Validation fails
    S-->>B: Re-render form with error message
    B-->>U: Display field errors
  else Validation passes
    S->>DB: INSERT INTO inquiries (?, ?, ...)
    DB-->>S: insertId
    S-->>B: Render success confirmation
    B-->>U: "Inquiry received"
  end
"""

# 10. Sequence: Admin login
diagrams["10_seq_login"] = """
sequenceDiagram
  actor A as Administrator
  participant B as Browser
  participant S as Express /admin/login
  participant DB as SQLite (admins)
  A->>B: Enter username and password
  B->>S: POST credentials
  S->>DB: SELECT * FROM admins WHERE username = ?
  DB-->>S: admin row (bcrypt hash)
  S->>S: bcrypt.compare(password, hash)
  alt Password matches
    S->>S: session.regenerate() + set adminId
    S-->>B: 302 redirect /admin/dashboard
    B-->>A: Dashboard shown
  else No match
    S-->>B: 302 redirect /admin/login?error=invalid
    B-->>A: Error message shown
  end
"""

# 11. Sequence: Chatbot interaction
diagrams["11_seq_chatbot"] = """
sequenceDiagram
  actor U as Visitor
  participant W as Chatbot Widget (chat.js)
  participant L as FAQ Matching Logic
  U->>W: Type a question
  W->>W: Show typing indicator
  W->>L: getBotResponse(message)
  L->>L: Lowercase and keyword match (10 intents)
  alt Keyword matched
    L-->>W: Intent answer + action buttons
  else No keyword matched
    L-->>W: Fallback reply + topic suggestions
  end
  W-->>U: Render bot response
"""

# 12. Flowchart: Auth middleware
diagrams["12_flow_auth"] = """
graph TD
  START(["Request to /admin/* route"]) --> H["Set Cache-Control: no-store"]
  H --> Q{"req.session.adminId exists?"}
  Q -->|Yes| NEXT["next() - run route handler"]
  Q -->|No| RED["Redirect to /admin/login"]
  NEXT --> END1(["Serve protected admin page"])
  RED --> END2(["Show login page"])
"""

# 13. Activity: Contact form validation
diagrams["13_activity_validation"] = """
graph TD
  A(["Receive POST /contact"]) --> B{"All required fields present?"}
  B -->|No| E1["Error: missing fields"]
  B -->|Yes| C{"Name 2-100 chars and valid?"}
  C -->|No| E2["Error: name"]
  C -->|Yes| D{"Email format valid?"}
  D -->|No| E3["Error: email"]
  D -->|Yes| F{"Phone valid characters?"}
  F -->|No| E4["Error: phone"]
  F -->|Yes| G{"Job details 10-2000 chars?"}
  G -->|No| E5["Error: details"]
  G -->|Yes| H["INSERT inquiry into SQLite"]
  H --> I(["Show success message"])
  E1 --> Z(["Re-render form with error"])
  E2 --> Z
  E3 --> Z
  E4 --> Z
  E5 --> Z
"""

# 14. State: Inquiry status lifecycle
diagrams["14_state_inquiry"] = """
stateDiagram-v2
  [*] --> New: Inquiry submitted by visitor
  New --> InProgress: Admin begins handling
  New --> Replied: Admin responds directly
  InProgress --> Replied: Response sent
  Replied --> [*]: Closed / archived
  InProgress --> [*]: Closed
"""

# 15. Class Diagram: Data Access Layer
diagrams["15_class_db"] = """
classDiagram
  class ExpressServer {
    +app
    +requireAdmin(req, res, next)
    +route handlers
  }
  class DataAccessLayer {
    +initDb() Promise
    +query(sql, params) Promise
    +execute(sql, params) Promise
    +getOne(sql, params) Promise
    +getDbType() string
  }
  class SQLiteDatabase {
    -file database.sqlite
    +all(sql, params, cb)
    +get(sql, params, cb)
    +run(sql, params, cb)
    +serialize()
  }
  ExpressServer --> DataAccessLayer : uses
  DataAccessLayer --> SQLiteDatabase : wraps
"""

for name, src in diagrams.items():
    path = os.path.join(OUT, name + ".mmd")
    with open(path, "w", encoding="utf-8") as f:
        f.write(src.strip() + "\n")
    print("wrote", path)

print("TOTAL", len(diagrams), "diagrams")
