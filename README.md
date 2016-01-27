# Nexus

Microservices proxy and manager that provides the ability to act as both a LAN/WAN microservices cluster manager. 
1. Provides a public-facing Services ('/services/') API:
  - Register services for automatic API discovery and exposure on the proxy
  - Unregister services
  - Service status and query
2. Provides zero-conf-based auto Service discovery for Services using udp multicast
  - Automatically registers services when services broadcast 'up' for automatic API discovery and exposure on the proxy
  - Automatically unregsiters services when services broadcast 'down'
3. Provides a REST API as a proxy over all registered services
4. [[future]] Provides an isomorphic (universal) app for analytics and management

# Installation

Nexus is an express app over jspm. To install:

<p><code>cd nexus</code></p>
<p><code>jspm init</code></p>

# Configuration

# Running

# Testing

# Packaging/Deployment
