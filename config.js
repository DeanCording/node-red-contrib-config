/**
 * Copyright 2016 Dean Cording <dean@cording.id.au>
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

        node.configs = n.configs;

        configure(node);

    };

    function configure(node) {

        node.configs.forEach( function(config) {
            if (config.tot === 'num') {
                config.to = Number(config.to);
            } else if (config.tot === 'json') {
                try {
                    config.to = JSON.parse(config.to);
                } catch(e2) {
                    this.error("Invalid JSON");
                    return;
                }
            } else if (config.tot === 'bool') {
                config.to = /^true$/i.test(rule.to);
            } else if (config.tot === 'date') {
                config.to = Date.now();
            }

            var target;
            if (config.pt === 'flow') {
                target = node.context().flow;
            } else if (config.pt === 'global') {
                target = node.context().global;
            }
            if (target) {
                target.set(config.p,config.to);
            }
        });
    }
    RED.nodes.registerType("config", ConfigNode);
};
