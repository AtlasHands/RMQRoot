new Vue({
    el: "#view",
    data: {
        array_size: 100,
        is_ordered: true,
        root_map_status: "Make RMQ Root Map",
        show_array: false,
        settings: {
            array_size: undefined,
            is_ordered: undefined,
        },
        stats:{
            blocks_referenced: undefined,
            left_scanned: undefined,
            right_scanned: undefined,
            internal_scanned: undefined
        },
        array: [],
        root_length: undefined,
        root_map: [],
        minimum_value: undefined,
        minimum_index: undefined,
        start_index: 0,
        end_index: 0,
    },
    methods:{
        startRMQ: function(){
            let left = parseInt(this.start_index);
            let right = parseInt(this.end_index);
            let min_left = Infinity;
            let min_left_index = undefined;
            let min_right = Infinity;
            let min_right_index = undefined;
            let internal_scanned = 0;
            //Adding this.root_length to combat less than root_length numbers being 0
            let left_to_scan = this.root_length-((left+this.root_length)%this.root_length);
            //Issue occurs when the left to scan is equal to the root length, it should be zero
            if(left_to_scan == this.root_length){
                left_to_scan = 0;
            }
            let right_to_scan = (right+1+this.root_length)%this.root_length
            let left_border = left_to_scan+left;
            let right_border = (right+1) - right_to_scan;
            let internal_blocks = Math.floor((right_border-left_border)/this.root_length)
            //If we have 0 internal blocks, we only need to explicitly check the range
            if(internal_blocks < 0){
                internal_scanned = right-left+1;
                internal_blocks = 0;
                left_to_scan = 0;
                right_to_scan = 0;
                min_internal = Infinity
                min_index = 0;
                //if we are just internal, we can just scan the range
                for(let x = left;x<right;x++){
                    if(this.array[x] < min_internal){
                        min_internal = this.array[x]
                        min_index = x;
                    }
                }
                this.minimum_index = min_index;
                this.minimum_value = min_internal;
            }else{
                //Scan left
                if(left_to_scan != 0){
                    for(let x = 0;x<=left_to_scan;x++){
                        console.log(left_border-x)
                        let value = this.array[left_border-x]
                        if(value < min_left){
                            min_left = value
                            min_left_index = left_border-x;
                        }
                    }
                }
                //Scan right
                if(right_to_scan != 0){
                    for(let x = 0;x<right_to_scan;x++){
                        let value = this.array[right-x]
                        if(value < min_right){
                            min_right = value
                            min_right_index = right-x
                        }
                    }
                }
                //Reference calculated block values
                let block_start = (left_border/this.root_length)
                let min_of_blocks = Infinity;
                let min_block_index = undefined
                for(let x = 0;x<internal_blocks;x++){
                    let min_of_block = this.root_map[block_start+x][0]
                    if(min_of_block < min_of_blocks){
                        min_of_blocks = min_of_block
                        min_block_index = this.root_map[block_start+x][1]
                    }
                }
                //Get the minimum value
                if(min_right < min_left && min_right < min_of_blocks){
                    this.minimum_value = min_right
                    this.minimum_index = min_right_index
                }else if(min_left < min_right && min_left < min_of_blocks){
                    this.minimum_value = min_left
                    this.minimum_index = min_left_index
                }else if(min_of_blocks < min_right && min_of_blocks < min_left){
                    this.minimum_value = min_of_blocks
                    this.minimum_index = min_block_index
                }
            }
            //Set values for the UI
            this.stats.blocks_referenced = internal_blocks;
            this.stats.right_scanned = right_to_scan;
            this.stats.left_scanned = left_to_scan;
            this.stats.internal_scanned = internal_scanned
        },
        makeRMQMap: function(){
            //Set values that reflect RMQ run settings
            this.settings.array_size = this.array_size
            this.settings.is_ordered = this.is_ordered
            let arr = []
            if(this.settings.is_ordered){
                arr = this.genOrderedArray()
            }else{
                arr = this.genRandomArray()
            }
            this.array = arr
            //Vue requires this to be reflective
            Vue.set(this,"root_map",this.makeMap(arr))
            this.root_map_status = "Root Map Generated"
        },
        //Make the map based on the root blocks
        makeMap: function(array){
            this.root_length = Math.ceil(Math.pow(array.length,.5))
            let min_roots = []
            let current_min = Infinity
            let min_index = undefined
            let current_progress = 0;
            for(let x = 0;x<array.length;x++){
                if(array[x] < current_min){
                    current_min = array[x]
                    min_index = x;
                }
                current_progress++;
                if(current_progress == this.root_length){
                    current_progress = 0;
                    min_roots.push([current_min,min_index]);
                    current_min = Infinity
                }
            }
            return min_roots;
        },
        //Get random array (unsorted)
        genRandomArray: function(){
            let arr = []
            for(let x = 0;x<this.settings.array_size;x++){
                arr[x] = Math.floor(Math.random() * 99999999);
            }
            return arr;
        },
        //Get ordered array (value = index)
        genOrderedArray: function(){
            let arr = []
            for(let x = 0;x<this.settings.array_size;x++){
                arr[x] = x;
            }
            return arr;
        }
    }
    
})