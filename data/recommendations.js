/**
 *  Sample lookup table listing customer properties and expected recommendations.
 */

const myLut = LUT.create({
    name: "Recommendations",
     ins: ["age","hobby"],
    outs: ["item","color"]
});

myLut.addRow({ ins:[0, LUT.ANY                  ], outs:["plush toy", "light green" ]}); 
myLut.addRow({ ins:[LUT.Range(1,10),  "cars"    ], outs:["toy car",   "red"         ]});
myLut.addRow({ ins:[LUT.Range(1,10),  "animals" ], outs:["frog doll", "green"       ]});
myLut.addRow({ ins:[LUT.Range(18,24), "travel"  ], outs:["backpack",  "blue"        ]});
myLut.addRow({ ins:[LUT.ANY,          "beige"   ], outs:["bicycle",   "beige"       ]});

myLut.addRow({ 
    ins:{age:LUT.ANY, hobby:"beige"},   
    outs:["bicycle", "white"]
});
myLut.addRow({
    ins:[LUT.ANY, LUT.ANY],
    outs:{item:"bicycle", color:"white"}
});

