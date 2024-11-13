import Nat "mo:base/Nat";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Order "mo:base/Order";
import Debug "mo:base/Debug";

actor {
    // Define the Score type
    type Score = {
        player: Text;
        score: Nat;
    };

    // Store scores in a stable variable
    stable var scores : [Score] = [];

    // Add a new score
    public func addScore(player: Text, score: Nat) : async () {
        let newScore : Score = {
            player = player;
            score = score;
        };
        
        let scoresBuffer = Buffer.fromArray<Score>(scores);
        scoresBuffer.add(newScore);
        
        // Sort scores in descending order
        scores := Buffer.toArray(scoresBuffer);
        scores := Array.sort<Score>(
            scores,
            func(a: Score, b: Score) : Order.Order {
                if (a.score > b.score) { #less }
                else if (a.score < b.score) { #greater }
                else { #equal }
            }
        );

        // Keep only top 10 scores
        if (scores.size() > 10) {
            scores := Array.tabulate<Score>(10, func(i) { scores[i] });
        };
    };

    // Get top scores
    public query func getTopScores() : async [Score] {
        scores
    };
}
