# node-red-contrib-config
A Node Red node for setting global and flow context properties at startup and during runtime.

This node allows you to store configuration information in a central location and use it to set global and flow context properties at startup (initialization phase) or during runtime. Multiple `config` nodes can be used to store alternate configuration settings and switch between them during runtime.  
![node-appearance](assets/node-appearance.png "Node appearance")  
**Fig. 1:** Node appearance

<a name="installation"></a>
## Installation

<a name="installation_in_node-red"></a>
### In Node-RED
* Via Manage Palette -> Search for "node-red-contrib-config"

<a name="installation_in_a_shell"></a>
### In a shell
* go to the Node-RED installation folder, e.g.: `~/.node-red`
* run `npm install node-red-contrib-config`

<a name="usage"></a>
## Usage

<a name="node_configuration"></a>
### Node Configuration

![node-settings](assets/node-settings.png "Node properties")  
**Fig. 2:** Node properties

#### Configuration of *Property* and *Value* ####
The object given in the **Property** field is the context property which shall be modified. This object can be a global or a flow variable.  
The contents of the **Value** field is the data which is written to the context property object. This object can be of the type
* string
* number
* boolean
* JSON
* timestamp


#### Checkbox *Active* ####
If  **Active** is checked (i.e. node is active), the configuration properties will be applied at startup before any flows are started. This may e.g. be used for initialization purposes.

<a name="input"></a>
### Input ###
If the node receives any `msg`, it will apply the configuration properties contained in that `config` node. I.e. the value of the *Value* field is written into the variable given in the *Property* field. The received `msg` is discarded.  
This allows e.g. to alter configurations **programmatically**.

Pressing the **button on the left side** of the node will also apply the configuration properties contained in that `config` node.  
This allows also to alter configurations **manually**.


<a name="output"></a>
### Output ###
The `config` node has no output data.

<a name="example"></a>
## Example ##
***
**Remark**: Example flows are present in the examples subdirectory. In Node-RED they can be imported via the import function and then selecting *Examples* in the vertical tab menue.
***

The example flow shows an example where the global variable *PC_Stability*
* is modified at startup (initial operation, only by the upper `config` node),
* can be modified by the left button of both `config` nodes (manual operation),
* can be modified by the upper both inject nodes (`msg` initiated operation).

The lower nodes only show the contents of the modified global variable.

<img src="assets/flow.png" title="Example flow" width="600" />

**Fig. 3:** `Config` node example

<details>
  <summary>Click to expand code snippet for the <em><b>example flow</b></em>.</summary>

```javascript
[{"id":"25e44718.693758","type":"tab","label":"Test config node","disabled":false,"info":""},{"id":"bd1b9414.8b32b8","type":"config","z":"25e44718.693758","name":"Install Linux","properties":[{"p":"PC_Stability","pt":"global","to":"Well done! Stable system.","tot":"str"}],"active":true,"x":420,"y":120,"wires":[]},{"id":"d8e9f39e.653ea","type":"inject","z":"25e44718.693758","name":"","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":210,"y":180,"wires":[["9e818396.ce9d2"]]},{"id":"2a388509.ad5742","type":"inject","z":"25e44718.693758","name":"","topic":"","payload":"","payloadType":"str","repeat":"0.1","crontab":"","once":true,"onceDelay":0.1,"x":220,"y":240,"wires":[["57ac7186.93afd8"]]},{"id":"f036c088.c54bd8","type":"debug","z":"25e44718.693758","name":"PC_Stability","active":true,"tosidebar":false,"console":false,"tostatus":true,"complete":"payload","targetType":"msg","x":670,"y":240,"wires":[]},{"id":"57ac7186.93afd8","type":"change","z":"25e44718.693758","name":"","rules":[{"t":"set","p":"payload","pt":"msg","to":"PC_Stability","tot":"global"}],"action":"","property":"","from":"","to":"","reg":false,"x":430,"y":240,"wires":[["f036c088.c54bd8"]]},{"id":"9730e6c0.d46aa","type":"inject","z":"25e44718.693758","name":"","topic":"","payload":"","payloadType":"str","repeat":"","crontab":"","once":false,"onceDelay":0.1,"x":210,"y":120,"wires":[["bd1b9414.8b32b8"]]},{"id":"9e818396.ce9d2","type":"config","z":"25e44718.693758","name":"Install Win","properties":[{"p":"PC_Stability","pt":"global","to":"Unstable system. May crash.","tot":"str"}],"active":false,"x":410,"y":180,"wires":[]}]
```
</details>
<br>


The  following figure shows the node configuration of the upper `config`node.

<img src="assets/example1.png" title="Example flow" width="300" />

**Fig. 4:** Example `Config` node properties
