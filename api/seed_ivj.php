<?php
require_once 'db.php';

$questions = [
    [1, "Reading a good book. (Pagbasa ng magandang libro)", 0],
    [2, "Respecting one’s parents (Paggalang sa magulang)", 0],
    [3, "Running away from home and being astray (Paglayas ng bahay at magpalaboy-laboy)", 1],
    [4, "Smoking cigarettes (Paninigarilyo)", 1],
    [5, "Cutting classes (Di pagpasok sa klase)", 1],
    [6, "Believing in God (Paniniwala sa Diyos)", 0],
    [7, "Destroying the properties of others (Pagsira sa gamit ng ibang tao)", 1],
    [8, "Cheating during examinations (Pandaraya sa eksam)", 1],
    [9, "Quarreling with brothers and sisters. (Pakikipag-away sa mga kapatid)", 1],
    [10, "Keeping the house clean. (Pagpapanatiling malinis ang bahay.)", 0],
    [11, "Shoplifting. (Pagnanakaw sa tindahan/grocery/department store)", 1],
    [12, "Eating with dirty hands. (Pagkain na marumi ang kamay)", 1],
    [13, "Treating someone cruelly. (Pang-aapi sa kapwa)", 1],
    [14, "Cruelty to animals. (Pagmamalupit sa hayop)", 1],
    [15, "Studying lessons well. (Pag-aaral nang mabuti)", 0],
    [16, "Coming home late at night. (Pag-uwi nang gabing-gabi.)", 1],
    [17, "Playing very loud and disturbing music. (Pagpapatugtog ng malakas at nakakaistorbong musika)", 1],
    [18, "Creating trouble in school. (Pangugulo sa eskewlahan)", 1],
    [19, "Taking care of personal belongings. (Pag-aalaga sa sariling gamit)", 0],
    [20, "Going to church/place of worship and praying. (Pagsimba at pagdarasal)", 0],
    [21, "Coming to school always late. (Palaging huli sa klase)", 1],
    [22, "Stealing (Pagnanakaw)", 1],
    [23, "Discussing about bad and malicious things. (Pag-uusap tungkol sa mga bagay na masasama at mapanira sa kapwa)", 1],
    [24, "Keeping good friends. (Pagpapanatili sa mabubuting kaibigan.)", 0],
    [25, "Arguing and fighting with parents and elders. (Pakikipag-away sa mga mgaulang at nakatatanda)", 1],
    [26, "Spending tuition fee. (Pagwaldas ng perang pambayad sa iskul.)", 1],
    [27, "Keeping oneself healthy. (Pagiging malusog).", 0],
    [28, "Dropping out of school. (Pagtigil sa pag-aaral.)", 1],
    [29, "Attempting to commit suicide. (Tangkang magpakamatay.)", 1],
    [30, "Obeying traffic rules. (Pagsunod sa trapiko)", 0],
    [31, "Getting high grades in school. (Pagkakaroon ng matataas na marka)", 0],
    [32, "Doing responsible household chores. (Paggawa ng gawaing bahay)", 0],
    [33, "Killing the neighbor’s pet. (Pagpatay sa alagang hayop ng kapitbahay)", 1],
    [34, "Driving while drunk. (Pagmamaneho ng lasing.)", 1],
    [35, "Doing a job well. (Paggawa nang maayos ng trabaho.)", 0],
    [36, "Disobeying parents. (Pagsiway sa utos ng magulang.)", 1],
    [37, "Taking prohibited drugs. (Paggamit ng droga o bawal na gamot)", 1],
    [38, "Coming home straight from school. (Pag-uwi ng deretso sa bahay.)", 0],
    [39, "Mother neglecting her family. (Pagpapabaya ni nanay sa pamilya)", 1],
    [40, "Being dishonest. (Pandaraya.)", 1],
    [41, "Having regular exercise for good health. (Pag-eehersisyo para sa kalusugan)", 0],
    [42, "Avoiding trouble. (Pag-iwas sa gulo)", 0],
    [43, "Beating someone. (Pananakit sa kapwa)", 1],
    [44, "Helping to benefit a younger sibling. (Pagtulong sa ikabubuti ng nakababatang kapatid)", 0],
    [45, "Volunteering in community work. (Pagtulong ng kusa o boluntaryong paggawa)", 0],
    [46, "Staging a hold up (Panghohold-up)", 1],
    [47, "Giving donations to charity. (Pagtulong sa nangangailangan)", 0],
    [48, "Keeping the environment clean. (Pagpapanatiling malinis sa kapaligiran)", 0],
    [49, "Disobeying traffic rules. (Paglabag sa batas trapiko.)", 1],
    [50, "Having bad work habits. (Hindi maayos na pagtatrabaho)", 1],
    [51, "Staying away from bad influence. (Pag-iwas sa masasamang barkada)", 0],
    [52, "Doing something good for somebody. (Paggawa ng mabuti sa iba.)", 0],
    [53, "Does not want to work. (Ayaw magtrabaho/tamad.)", 1],
    [54, "Attending to the needs of the family. (Pagtugon sa pangangailangan ng pamilya.)", 0]
];

try {
    // Delete existing IVJ questions first
    $pdo->exec("DELETE FROM question_bank WHERE assessment_type = 'IVJ'");
    
    $stmt = $pdo->prepare("INSERT INTO question_bank (assessment_type, statement, is_reverse_scored) VALUES ('IVJ', :stmt, :rev)");
    
    foreach ($questions as $q) {
        $stmt->execute([
            ':stmt' => $q[1],
            ':rev' => $q[2]
        ]);
    }
    
    echo "Successfully seeded all 54 IVJ questions.\n";
} catch (PDOException $e) {
    echo "Error seeding questions: " . $e->getMessage() . "\n";
}
?>
