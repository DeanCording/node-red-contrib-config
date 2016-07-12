/**
 * Copyright 2013, 2016 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
    "use strict";

    function ConfigNode(n) {
        RED.nodes.createNode(this, n);

        this.configs = n.configs;
        if (!this.configs) {
            var config = {
                t:(n.action=="replace"?"set":n.action),
                p:n.property||""
            }

            if ((config.t === "set")||(config.t === "move")) {
                config.to = n.to||"";
            } else if (config.t === "change") {
                config.from = n.from||"";
                config.to = n.to||"";
                config.re = (n.reg===null||n.reg);
            }
            this.configs = [config];
        }

        var valid = true;
        for (var i=0;i<this.configs.length;i++) {
            var config = this.configs[i];
            // Migrate to type-aware configs
            if (!config.pt) {
                config.pt = "msg";
            }
            if (config.t === "change" && config.re) {
                config.fromt = 're';
                delete config.re;
            }
            if (config.t === "set" && !config.tot) {
                if (config.to.indexOf("msg.") === 0 && !config.tot) {
                    config.to = config.to.substring(4);
                    config.tot = "msg";
                }
            }
            if (!config.tot) {
                config.tot = "str";
            }
            if (!config.fromt) {
                config.fromt = "str";
            }
            if (config.t === "change" && config.fromt !== 'msg' && config.fromt !== 'flow' && config.fromt !== 'global') {
                config.fromRE = config.from;
                if (config.fromt !== 're') {
                    config.fromRE = config.fromRE.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                }
                try {
                    config.fromRE = new RegExp(config.fromRE, "g");
                } catch (e) {
                    valid = false;
                    this.error(RED._("change.errors.invalid-from",{error:e.message}));
                }
            }
            if (config.tot === 'num') {
                config.to = Number(config.to);
            } else if (config.tot === 'json') {
                try {
                    config.to = JSON.parse(config.to);
                } catch(e2) {
                    valid = false;
                    this.error(RED._("change.errors.invalid-json"));
                }
            } else if (config.tot === 'bool') {
                config.to = /^true$/i.test(config.to);
            }
        }

        function applyConfig(msg,config) {
            try {
                var property = config.p;
                var value = config.to;
                var current;
                var fromValue;
                var fromType;
                var fromRE;
                if (config.tot === "msg") {
                    value = RED.util.getMessageProperty(msg,config.to);
                } else if (config.tot === 'flow') {
                    value = node.context().flow.get(config.to);
                } else if (config.tot === 'global') {
                    value = node.context().global.get(config.to);
                } else if (config.tot === 'date') {
                    value = Date.now();
                }
                if (config.t === 'change') {
                    if (config.fromt === 'msg' || config.fromt === 'flow' || config.fromt === 'global') {
                        if (config.fromt === "msg") {
                            fromValue = RED.util.getMessageProperty(msg,config.from);
                        } else if (config.tot === 'flow') {
                            fromValue = node.context().flow.get(config.from);
                        } else if (config.tot === 'global') {
                            fromValue = node.context().global.get(config.from);
                        }
                        if (typeof fromValue === 'number' || fromValue instanceof Number) {
                            fromType = 'num';
                        } else if (typeof fromValue === 'boolean') {
                            fromType = 'bool'
                        } else if (fromValue instanceof RegExp) {
                            fromType = 're';
                            fromRE = fromValue;
                        } else if (typeof fromValue === 'string') {
                            fromType = 'str';
                            fromRE = fromValue.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
                            try {
                                fromRE = new RegExp(fromRE, "g");
                            } catch (e) {
                                valid = false;
                                node.error(RED._("change.errors.invalid-from",{error:e.message}));
                                return;
                            }
                        } else {
                            node.error(RED._("change.errors.invalid-from",{error:"unsupported type: "+(typeof fromValue)}));
                            return
                        }
                    } else {
                        fromType = config.fromt;
                        fromValue = config.from;
                        fromRE = config.fromRE;
                    }
                }
                if (config.pt === 'msg') {
                    if (config.t === 'delete') {
                        RED.util.setMessageProperty(msg,property,undefined);
                    } else if (config.t === 'set') {
                        RED.util.setMessageProperty(msg,property,value);
                    } else if (config.t === 'change') {
                        current = RED.util.getMessageProperty(msg,property);
                        if (typeof current === 'string') {
                            if ((fromType === 'num' || fromType === 'bool') && current === fromValue) {
                                // str representation of exact from number/boolean
                                // only replace if they match exactly
                                RED.util.setMessageProperty(msg,property,value);
                            } else {
                                current = current.replace(fromRE,value);
                                RED.util.setMessageProperty(msg,property,current);
                            }
                        } else if ((typeof current === 'number' || current instanceof Number) && fromType === 'num') {
                            if (current == Number(fromValue)) {
                                RED.util.setMessageProperty(msg,property,value);
                            }
                        } else if (typeof current === 'boolean' && fromType === 'bool') {
                            if (current.toString() === fromValue) {
                                RED.util.setMessageProperty(msg,property,value);
                            }
                        }
                    }
                } else {
                    var target;
                    if (config.pt === 'flow') {
                        target = node.context().flow;
                    } else if (config.pt === 'global') {
                        target = node.context().global;
                    }
                    if (target) {
                        if (config.t === 'delete') {
                            target.set(property,undefined);
                        } else if (config.t === 'set') {
                            target.set(property,value);
                        } else if (config.t === 'change') {
                            current = target.get(msg,property);
                            if (typeof current === 'string') {
                                if ((fromType === 'num' || fromType === 'bool') && current === fromValue) {
                                    // str representation of exact from number/boolean
                                    // only replace if they match exactly
                                    target.set(property,value);
                                } else {
                                    current = current.replace(fromRE,value);
                                    target.set(property,current);
                                }
                            } else if ((typeof current === 'number' || current instanceof Number) && fromType === 'num') {
                                if (current == Number(fromValue)) {
                                    target.set(property,value);
                                }
                            } else if (typeof current === 'boolean' && fromType === 'bool') {
                                if (current.toString() === fromValue) {
                                    target.set(property,value);
                                }
                            }
                        }
                    }
                }
            } catch(err) {/*console.log(err.stack)*/}
            return msg;
        }
        if (valid) {
            var node = this;
            this.on('input', function(msg) {
                for (var i=0;i<this.configs.length;i++) {
                    if (this.configs[i].t === "move") {
                        var r = this.configs[i];
                        msg = applyConfig(msg,{t:"set", p:r.to, pt:r.tot, to:r.p, tot:r.pt});
                        applyConfig(msg,{t:"delete", p:r.p, pt:r.pt});
                    } else {
                        msg = applyConfig(msg,this.configs[i]);
                    }
                    if (msg === null) {
                        return;
                    }
                }
                node.send(msg);
            });
        }
    }
    RED.nodes.registerType("config", ConfigNode);
};
