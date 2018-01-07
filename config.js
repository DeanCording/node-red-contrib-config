/**
 * Copyright 2018 Dean Cording <dean@cording.id.au>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 **/

module.exports = function(RED) {
    "use strict";

    function ConfigNode(n) {
        RED.nodes.createNode(this, n);

        var node = this;

        node.properties = n.properties;

        node.configure = function(node) {
            node.properties.forEach( function(property) {

                var value = RED.util.evaluateNodeProperty(property.to, property.tot, node, null)

                if (property.pt === 'flow') {
                    node.context().flow.set(property.p,value);
                } else if (property.pt === 'global') {
                    node.context().global.set(property.p,value);
                }
            });
        };
        if (n.active) node.configure(node);
	
	node.on("input", function(msg) {
		node.configure(node);
	});
    }
    RED.nodes.registerType("config", ConfigNode);

    RED.httpAdmin.post("/config/:id", RED.auth.needsPermission("config.write"), function(req,res) {
        var node = RED.nodes.getNode(req.params.id);
        if (node != null) {
            try {
                node.configure(node);
                res.sendStatus(200);
            } catch(err) {
                res.sendStatus(500);
                node.error("Config failed: "+ err.toString());
            }
        } else {
            res.sendStatus(404);
        }
    });

};
