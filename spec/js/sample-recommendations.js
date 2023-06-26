
/**
 * Simple bthread that generates test cases based on the lookup table defined 
 * in data/recommendations.js
 */
bthread("testLut", function(){

    // 1. Select a use case from the possibilities defined by the LUT rows
    let useCase = request(myLut.generateLutEvents());
    
    // 2. (Mock) setting the query parameters in the tested system
    //     This could be replaced by UI clicks or setting API call parameters
    request(Event(`set age=${useCase.data.ins.age}`));
    request(Event(`set hobby=${useCase.data.ins[1]}`));

    // 3. Validate that the recommendation is as expected
    let expected = myLut.lookup(useCase.data.ins);
    request( Event(`item should be "${expected[0].sampleValue()}"`) );     // access by index
    request( Event(`color should be "${expected.color.sampleValue()}"`));  // access by name
    request( Event("Expecting", {
        color: expected.color.sampleValue(),
        item: expected.item.sampleValue()
    }))
    
});
