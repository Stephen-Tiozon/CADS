export interface LMDQuestion {
  id: number
  dilemma: string
  options: string[]
  scores: number[]
}

export const questions: LMDQuestion[] = [
  {
    id: 1,
    dilemma:
      "Natapunan ng softdrinks ang damit mo ng isang pasahero sa jeep. Ano ang gagawin mo? Bakit?",
    options: [
      "Magagalit ako kasi hindi siya maingat.",
      "Pagpasensiyahan na lang baka mangyari din sa akin yong ganoon.",
      "Hindi na lang ako kikibo kasi baka isipin nila na maliit lang naman na isyu pinalalaki ko pa.",
      "Pagpasensiyahan ko na lang kasi hindi naman ipinagbabawal ang inumin sa jeep.",
      "Pagsasabihan ko na sa susunod ubusin muna niya ang kanyang softdrink bago sumakay para hindi siya makapinsala ng iba.",
      "Pagsasabihan ko siya sa paraan na hindi naman siya mapapahiya kasi alam ko ang damdamin ng napagsasabihan sa harap ng maraming tao.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 2,
    dilemma:
      "Nilason ng inyong kapitbahay ang inyong alagang aso. Ano ang gagawin mo? Bakit?",
    options: [
      "Aawayin ko siya at pababayaran ko ang aso.",
      "Alamin ko ang dahilan kasi baka may napinsala rin ang aso ko.",
      "Alamin ko ang dahilan para manatili ang aming pagkakaibigan.",
      "Alamin ko ang dahilan, kasi may nilabag siyang batas.",
      "Alamin ko ang dahilan kasi baka ako rin ang may pagkukulang.",
      "Ipapaliwanag ko sa kanya na mali ang ginawa niya, kasi kahit buhay ng hayop ay dapat na igalang.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 3,
    dilemma:
      "Napatid mo ang alambre ng kuryente sa kalye habang nanunungkit ka ng mangga. Ano ang gagawin mo? Bakit?",
    options: [
      "Aayusin ko ang alamre baka mapagalitan ako.",
      "Aayusin ko ang alamre upang hindi ako pagbawalan na kumuha uli ng magga.",
      "Aayusin ko ang alambre kasi kung may nakakita sa akin at pabayaan ko lang, sasabihin nila na napakasama kong bata.",
      "Sasabihin ko sa kinauukulan, kasi kailangan maibalik nang tama ang alamre.",
      "Sasabihin ko sa kinauukulan upang hindi makapinsala.",
      "Sasabihin ko sa kinauukulan upang humingi ng tulong. Hindi dapat takasan ang problema na nagawa ko.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 4,
    dilemma:
      "Nakita mo ang grupo ng mga kabataan na sinisira ang bintana sa eskuwelahan ng inyong lugar. Ano ang gagawin mo? Bakit?",
    options: [
      "Hindi ko na lang papansinin, kasi baka magalit sila sa akin.",
      "Hindi ko na lang papansinin, para walang gulong mangyari.",
      "Isusumbong ko sa guwardiya o sa opisyal ng barangay upang matuwa naman sila sa akin.",
      "Isusumbong ko sa kinauukulan ang ginawa ng mga bata kasi masama iyon.",
      "Isusumbong ko sa kinauukulan upang madisiplina ang mga naturang bata para makatulong ako at panatilihing maayos ang aming komunidad.",
      "Isusumbong ko sa kinauukulan upang malaman nila na may malasakit ako bilang isang mamamayan.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 5,
    dilemma:
      "Napagtripan ng iyong barkada ang isang bagong salta sa barangay. Ano ang gagawin mo? Bakit?",
    options: [
      "Pabayaan ko lang sila, kasi baka madamay ako.",
      "Pagsasabihan ko sila na tumigil, para hindi naman gawin sa amin ng iba.",
      "Pagsasabihan ko sila dahil hindi tama ang ginagawa nila.",
      "Pagsasabihan ko sila kasi labag sa batas ang basta na lang manakit ng iba.",
      "Pagsasabihan ko sila at kung ayaw nilang magpaawat, tatawag ako ng barangay tanod para awatin sila, kasi kailangan maging tahimik ang lugar.",
      "Isusumbong ko sila sa barangay para maawat sila at hindi dapat manakit ng kapwa, lalo pa’t wala namang ginagawang masama.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 6,
    dilemma:
      "Hinuli ka ng pulis sa kasalanang hindi mo alam. Para pakawalan ka, humihingi siya ng suhol na pera. Ano ang gagawin mo? Bakit?",
    options: [
      "Magbibigay na lang ako kung kaya ko, para makawala ako.",
      "Hindi ako basta magbibigay, kasi wala naman akong pera.",
      "Kailangan ko munang malaman sa kanya kung bakit ako hinuhuli, kasi wala naman akong ginagawang masama.",
      "Hindi ako magbibigay kasi labag sa batas ang ginagawa niya.",
      "Hindi ako magbibigay kasi kailangang matigil ang panunuhol.",
      "Hindi ako magbibigay, kasi gusto kong manatili ang maganda kong pagtitiwala sa mga pulis.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 7,
    dilemma:
      "Pinahiya ng inyong kapitbahay ang iyong nanay. Ano ang gagawin mo? Bakit?",
    options: [
      "Pabayaan na lang, para hindi na humaba ang problema.",
      "Pabayaan na lang, kasi baka may nagawang di-tama ang nanay ko.",
      "Hihingi ako ng paliwanag, kasi hindi dapat mabahiran ng masama ang aming magandang pangalan.",
      "Hihingi ako ng paliwanag, kasi karapatan naming malaman ang dahilan.",
      "Hihingi ako ng paliwanag para manatili ang aming magandang samahan.",
      "Hayaan ko na lang, kasi kaya namang ayusin yon ng nanay ko. May tiwala ako sa kanya.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 8,
    dilemma:
      "Pinilit ka ng iyong barakada na gumamit ng ipinagbabawal na gamot? Ano ang gagawin mo? Bakit?",
    options: [
      "Susubukan kong gumamit kasi ayaw kong magalit sila sa akin.",
      "Hindi ako gagamit, kasi gusto ko nga na itigil nila ang ipinagbabawal na gamot.",
      "Hindi ako gagamit para hindi ako magkaroon ng masamang record.",
      "Hindi ako gagamit kasi labag sa batas ang ipinagbabawal na gamot.",
      "Hindi ako gagamit, kasi alam ko na marami ng tao ang nasira sa ipinagbabawal na gamot.",
      "Hindi ako gagamit, kasi nagkakampanya nga ako laban sa ipinagbabawal na gamot.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 9,
    dilemma:
      "Siniraan ka ng iyong kasamahan sa barangay. Ano ang gagawin mo? Bakit?",
    options: [
      "Susugurin ko siya, kasi mali ang kanyang ginagawa.",
      "Gagantihan ko siya para maintindihan niya ang kanyang ginagawa. Susugurin ko siya, kasi mali ang kanyang ginagawa.",
      "Pabayaan na lang, kasi malinis naman ang pangalan ko sa barangay.",
      "Pabayaan na lang, kasi may mga kaukulang batas na magbibigay liwanag sa anumang issue o paratang.",
      "Pabayaan na lang, kasi bahala ng manghusga ang sambayanan.",
      "Pabayaan na lang, kasi matatag ang aking paninindigan para sa kabutihan at ikauunlad ng aming barangay.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 10,
    dilemma:
      "Naiinis ka sa mga kapatid mo dahil lagi nilang pinakikialaman ang mga gamit mo. Ano ang gagawin mo? Bakit?",
    options: [
      "Tatakutin at pagagalitan ko sila, para matigil ang kanilang pakikialam.",
      "Itatago ko na lang ang mga gamit ko, para di nila mapakialaman.",
      "Ipaliliwanag ko sa kanila na gusto kong maging maingat sa aking mga gamit para tumagal ang pakinabang nito.",
      "Ipaliliwanag ko sa kanila na hindi tama ang nakikialam sa gamit ng iba.",
      "Ipaliliwanag ko sa kanila na puwede ko namang ibahagi sa kanila ang mga gamit ko, basta magpaalam sila.",
      "Ipaliliwanag ko sa kanila na kahit sa magkakapatid, kailangan ang respeto sa isa't isa.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 11,
    dilemma:
      "Pinagagalitan ka ng iyong mga magulang dahil nakikipagbarkada ka sa mga kabataan na gumagawa ng hindi maganda. Ano ang gagawin mo? Bakit?",
    options: [
      "Makikinig ako sa aking mga magulang para di ako mapagalitan.",
      "Ipagtatanggol ko ang aking mga barkada, kasi wala naman kaming masamang ginagawa.",
      "Makikinig ako sa aking mga magulang para masabi nila na masunurin ako.",
      "Itatanong ko sa aking mga magulang kung bakit nasabi nilang masama ang aking mga kaibigan. Kasi kung masama nga, ayaw ko ring makagawa ng labag sa batas.",
      "Itatanong ko sa aking mga magulang kung anong masama ang alam nila sa aking mga kaibigan, kasi gusto ko ring makaiwas sa anumang gulo.",
      "Ipaliliwanag ko sa aking mga magulang na gusto kong maging kasangkapan sa pagbabago ng aking mga kaibigan.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 12,
    dilemma:
      "Nagastos mo ang perang pambayad ng iyong nanay sa tindahan. Ano ang gagawin mo? Bakit?",
    options: [
      "Hindi ko aaminin na nagastos ko, kasi wala namang nakakaalam na akong kumuha at ayaw kong mapagalitan.",
      "Sasabihin ko ang totoo para wala ng madamay na iba.",
      "Sasabihin ko ang totoo para hindi ako masira sa nanay ko.",
      "Sasabihin ko ang totoo, kasi ang pagiging tapat ay pagsasama ng maluwat.",
      "Sasabihin ko ang totoo kasi kailangan magawan ng paraan na mabayaran ang tindahan. Para ito sa kabutihan ng lahat.",
      "Sasabihin ko ang totoo kasi hindi ako matatahimik na madagdagan ang aking kasalanan.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 13,
    dilemma: "Nasuklian ka ng sobra sa tindahan. Ano ang gagawin mo? Bakit?",
    options: [
      "Hindi ko na ibabalik ang sobra, kasi kailangan ko yong pera.",
      "Ibabalik ko yong sobra, kasi baka mas malaki ang mawala sa akin.",
      "Ibabalik ko yong sobra para lalo akong pagkatiwalaan ng iba.",
      "Ibabalik ko yong sobra kasi yon ang naaayon sa batas.",
      "Ibabalik ko yong sobra kasi yon ay isang magandang kaugalian.",
      "Ibabalik ko yong sobra, kasi hindi ko dapat pakinabangan ang hindi ko pinaghirapan.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
  {
    id: 14,
    dilemma:
      "Saksi ka sa pagnanakaw ng iyong kaibigan. Ano ang gagawin mo? Bakit?",
    options: [
      "Pababayan ko sila, kasi baka magalit sila sa akin.",
      "Ipagtatanggol ko ang sarili ko kapag ako ay idinamay nila.",
      "Pagsasabihan ko sila na ang ganoon ay hindi gawain ng mga mabuting bata.",
      "Pagsasabihan ko sila na may batas na nagpaparusa sa masamang gawain.",
      "Pagsasabihan ko sila na nakakasira sa pangalan ang masamang gawain.",
      "Pagsasabihan ko sila na labag sa mata ng Diyos at ng tao ang masamang gawain.",
    ],
    scores: [1, 2, 3, 4, 5, 6],
  },
]
