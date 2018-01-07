# node-red-contrib-config
A Node Red node for setting global and flow context properties at startup.

This node allows you to store configuration information in a central location
and use it to set global and flow context properties.  Multiple Config nodes
can store alternate configuration settings and switch between them at run time.

If the Config node is Active, the configuration properties will be applied at 
startup before any flows are started.

If the node receives any message, it will apply the configuration properties
contained in that Config node. The received message is discarded. This allows you to 
have alternate configurations and programatically switch between them as needed.

Pressing the button on the left side of the node will apply the configuration properties
contained in that Config node.  This allows you to have alternate configurations
and manually switch between them as needed.
