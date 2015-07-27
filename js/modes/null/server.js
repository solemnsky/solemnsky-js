/*                  ******** null/snap.js ********                    //
\\ Snapshot creation and merging methods are defined here.            \\
//                  ******** null/snap.js ********                    */

// snapshots represent deltas against the game state
// they are represented as strings, and should have 
// a high useful information : string length ratio 
// since they comprise most of the network traffic generated
// by the game

