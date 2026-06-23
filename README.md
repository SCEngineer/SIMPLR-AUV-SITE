# SIMPLR-AUV

**S**ubsurface **I**ntegrated **M**ission **P**latform for **L**ow-complexity **R**obotics — **A**utonomous **U**nderwater **V**ehicle

An autonomous multi-mission platform built on accessible commodity compute and designed for distributed cloud-based operations.

---

## Overview

SIMPLR-AUV is an autonomous underwater vehicle system targeting industrial-grade multi-domain ISR capability at a system cost **orders of magnitude below conventional platforms** with comparable capability.

The system is designed around a single guiding philosophy: **industrial-grade capability using accessible parts.** Capabilities historically reserved for well-funded defense and government programs are achievable through novel system architecture and software design rather than expensive proprietary hardware.

The system comprises approximately **37,500 lines of Python** for the autonomy and sensor-processing stack, and **17,000 lines of JavaScript/HTML** for the browser-based cloud operations suite — all designed and written by a single inventor. The complete software stack is operational and simulation-validated end-to-end. Vehicle construction is pending.

---

## Architecture

SIMPLR-AUV uses a four-layer hierarchical architecture, with each class of computation assigned to the lowest-cost processor capable of performing it reliably. This mapping is reflected directly in the repository structure.

### Layer 1 — Cloud Operations (`auvcs/`, `portal/`)

The **AUVCS** (AUV Cloud Server) provides mission planning, telemetry analysis, ISR product management, and real-time tactical display. It runs on cloud infrastructure (currently a GCP VM) and connects to the vehicle through an encrypted WireGuard tunnel.

The cloud suite is delivered as self-contained browser applications — no software installation, no licensing, no specialist training. All tools are accessed through the **Mission Portal**, an authenticated launcher that enforces role-based access control across the operator team.

**Mission Systems**

- **Mission Portal** (`portal/`) — authenticated single-sign-on launcher for all cloud tools; JWT-based session management with bcrypt-hashed credentials and an admin panel for user provisioning
- **Ground Control (GCS)** — real-time vehicle telemetry, command and control, and mission monitoring dashboard
- **Mission Planner** — interactive map-based waypoint and task authoring with Leaflet satellite imagery
- **Mission Payload Station (MPS)** — tactical display and payload sensor management for cleared payload operators

**Intelligence & Analysis**

- **Log Analyzer** — post-mission telemetry visualization with dedicated obstacle-avoidance performance analysis and vehicle flight track overlay pulled directly from the avionics Pi
- **Signal Analysis** — post-mission SIGINT accuracy assessment: overlays detected emitter positions on a map, evaluates geolocation error against ground truth, and scores RF parameter accuracy (frequency, SNR) and classification performance across all signals collected during the mission
- **Technique Generator** — Claude AI-powered click-to-analyze workflow for non-specialist ISR operators
- **Technique Playbook** — browse and execute stored SIGINT exploitation technique library

### Layer 2 — Sensor Processing (`jetson/`)

An **NVIDIA Jetson Orin Nano Super** handles all GPU-accelerated sensor work:

- Multi-domain RF signal classification across multiple RF waveforms
- Passive RF emitter geolocation using a single moving receiver
- Signal demodulation and decoding (canonical demod implementations live in `jetson/demod/`)
- Underwater video object detection and geolocation
- 
### Layer 3 — Vehicle Management (`avionics-pi/`)

A **Raspberry Pi 5** runs the autonomy stack: navigation, mission execution, hardware abstraction, failsafe management, and actuator control. It receives processed sensor products from the Jetson over Gigabit Ethernet and coordinates with the sensor Pi over an internal UDP message bus.

Key autonomy components include:

- Mission executive with task-plugin guidance system (dive, climb, GPS fix, ISR survey, transmit, etc.)
- Mission-aware 3D obstacle avoidance with cross-track error minimization
- Dead-reckoning navigation with EKF sensor fusion and adaptive position-uncertainty handling
- Hardware abstraction layer supporting both simulation and physical hardware

### Layer 4 — Actuator I/O Node (Raspberry Pi Zero 2 W, hardware in design)

A single **Raspberry Pi Zero 2 W** in the Center WTC acts as a distributed actuator-I/O node, offloading low-level real-time peripheral drive from the Pi 5 vehicle manager. It drives the X-tail servos, the ESC (propulsion), and the ballast/load MOSFET switches, and connects to the Pi 5 as a USB-attached peripheral within the same compartment (it is not an independent node on the vehicle Ethernet LAN). It runs standard Linux, so it shares the same software environment as the rest of the stack with no separate firmware toolchain. Vehicle-state sensors (IMU, GPS, RM3100 compass, depth, leak module, paddlewheel velocity, and the obstacle-avoidance ping sonar) are read directly by the Pi 5.

### Sensor Pi (`sensor-pi/`)

A second Raspberry Pi hosts the SDR backend, IQ capture, signal synthesis, and emitter configuration data. It feeds raw IQ to the Jetson for GPU-accelerated processing.

---

## Capabilities (Simulation-Validated)

The following capabilities are operational and demonstrated in simulation as of this writing:

- Autonomous underwater navigation with dead reckoning and EKF sensor fusion
- Real-time 3D obstacle avoidance with mission-route awareness
- Passive RF spectrum survey across multiple waveform families
- Passive RF emitter geolocation from a single moving receiver
- Multi-signal classification and GPU-accelerated demodulation
- Underwater video surveillance with real-time object detection
- Optical velocity sensing as an acoustic-silent alternative to traditional DVL
- Encrypted command and control over WireGuard
- Real-time multi-domain tactical display
- Autonomous surface/submerge mission execution
- ISR product generation and encrypted transmission
- Browser-based mission planning and post-mission analysis

---

## Distributed Operations Model

SIMPLR-AUV is designed from the ground up for **distributed, role-segmented operations** across geographically separate workstations:

- **Mission Planner** authors missions on one workstation
- **Vehicle Operator (GCS)** drives the vehicle from a second workstation, seeing only opaque task labels (e.g., `DO_ISR`) without payload contents
- **Payload Operator (MPS)** is cleared into payload specifics and receives payload data when the vehicle surfaces
- **Analyst** reviews navigation and performance telemetry from a fourth workstation

This compartmented model maps cleanly to real ISR operations where need-to-know separation must be enforced at the system level, not just by policy. Future development is targeting cloud-based mission storage with role-based access controls so that mission files can be transported by an operator who is not cleared to read their contents.

---

## Repository Structure

```
simplr-auv/
├── auvcs/          Cloud operations server and browser-based UI suite
├── portal/         Mission Portal — authenticated launcher and user management
├── jetson/         GPU-accelerated sensor processing (classify + demod)
├── avionics-pi/    Vehicle autonomy: navigation, executive, guidance, control
├── sensor-pi/      SDR backend, IQ capture, signal synthesis
├── design-aids/    Tools and analysis utilities (in progress)
├── missions/       Mission file storage (architecture TBD — see roadmap)
└── .gitignore
```

Each processor directory is self-contained — its files are deployed to the corresponding hardware. Inter-processor communication happens over the network protocols described in the Architecture section.

---

## Status

**Software:** Full autonomy stack operational. End-to-end simulation missions demonstrated, including a Link16 ISR mission completed end-to-end on the actual Jetson hardware.

**Vehicle:** Mechanical design near-complete. Hardware integration pending. The hardware abstraction layer has been built specifically to allow the autonomy software to run identically against simulation or physical hardware, with sensor-detection fallback to simulation when physical hardware is absent.

**Cloud Operations Suite:** Operational. The Mission Portal, Mission Planner, Log Analyzer, and Signal Analysis tools have all been used to plan, execute, and analyze simulation missions, including end-to-end Link16 ISR missions.

---

## Roadmap

In approximate order:

- Vehicle hardware build and integration with the existing autonomy stack
- Pi Zero 2 W actuator-I/O node integration
- Encrypted mission distribution — missions encrypted to the vehicle's key so transport operators handle ciphertext only
- Cloud-based mission storage with role-segmented access
- Multi-vehicle coordination
- Additional sensor payloads as the platform matures

---

## Applications

**Defense:**

- Harbor and port security via passive RF and optical surveillance
- Critical underwater infrastructure protection (pipelines, cables, offshore platforms)
- Force protection in littoral environments
- Counter-UAS through RF control-link geolocation

**Commercial:**

- Maritime domain awareness for commercial port operators
- Environmental monitoring and survey
- Offshore infrastructure inspection
- Search and rescue support

---

## Contact

Wayne Folsom — system designer and sole developer.

This repository is private. Access is granted on an individual basis for review purposes.
