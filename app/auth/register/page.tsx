"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"

const turkishCities = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Amasya",
  "Ankara",
  "Antalya",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Isparta",
  "Mersin",
  "İstanbul",
  "İzmir",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Kahramanmaraş",
  "Mardin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Şanlıurfa",
  "Uşak",
  "Van",
  "Yozgat",
  "Zonguldak",
  "Aksaray",
  "Bayburt",
  "Karaman",
  "Kırıkkale",
  "Batman",
  "Şırnak",
  "Bartın",
  "Ardahan",
  "Iğdır",
  "Yalova",
  "Karabük",
  "Kilis",
  "Osmaniye",
  "Düzce",
]

const cityDistricts: Record<string, string[]> = {
  İstanbul: [
    "Adalar",
    "Arnavutköy",
    "Ataşehir",
    "Avcılar",
    "Bağcılar",
    "Bahçelievler",
    "Bakırköy",
    "Başakşehir",
    "Bayrampaşa",
    "Beşiktaş",
    "Beykoz",
    "Beylikdüzü",
    "Beyoğlu",
    "Büyükçekmece",
    "Çatalca",
    "Çekmeköy",
    "Esenler",
    "Esenyurt",
    "Eyüpsultan",
    "Fatih",
    "Gaziosmanpaşa",
    "Güngören",
    "Kadıköy",
    "Kağıthane",
    "Kartal",
    "Küçükçekmece",
    "Maltepe",
    "Pendik",
    "Sancaktepe",
    "Sarıyer",
    "Silivri",
    "Sultanbeyli",
    "Sultangazi",
    "Şile",
    "Şişli",
    "Tuzla",
    "Ümraniye",
    "Üsküdar",
    "Zeytinburnu",
  ],
  Ankara: [
    "Akyurt",
    "Altındağ",
    "Ayaş",
    "Bala",
    "Beypazarı",
    "Çamlıdere",
    "Çankaya",
    "Çubuk",
    "Elmadağ",
    "Etimesgut",
    "Evren",
    "Gölbaşı",
    "Güdül",
    "Haymana",
    "Kalecik",
    "Kazan",
    "Keçiören",
    "Kızılcahamam",
    "Mamak",
    "Nallıhan",
    "Polatlı",
    "Pursaklar",
    "Sincan",
    "Şereflikoçhisar",
    "Yenimahalle",
  ],
  İzmir: [
    "Aliağa",
    "Balçova",
    "Bayındır",
    "Bayraklı",
    "Bergama",
    "Beydağ",
    "Bornova",
    "Buca",
    "Çeşme",
    "Çiğli",
    "Dikili",
    "Foça",
    "Gaziemir",
    "Güzelbahçe",
    "Karabağlar",
    "Karaburun",
    "Karşıyaka",
    "Kemalpaşa",
    "Kınık",
    "Kiraz",
    "Konak",
    "Menderes",
    "Menemen",
    "Narlıdere",
    "Ödemiş",
    "Seferihisar",
    "Selçuk",
    "Tire",
    "Torbalı",
    "Urla",
  ],
  Bursa: [
    "Büyükorhan",
    "Gemlik",
    "Gürsu",
    "Harmancık",
    "İnegöl",
    "İznik",
    "Karacabey",
    "Keles",
    "Kestel",
    "Mudanya",
    "Mustafakemalpaşa",
    "Nilüfer",
    "Orhaneli",
    "Orhangazi",
    "Osmangazi",
    "Yenişehir",
    "Yıldırım",
  ],
  Antalya: [
    "Akseki",
    "Aksu",
    "Alanya",
    "Demre",
    "Döşemealtı",
    "Elmalı",
    "Finike",
    "Gazipaşa",
    "Gündoğmuş",
    "İbradı",
    "Kaş",
    "Kemer",
    "Kepez",
    "Konyaaltı",
    "Korkuteli",
    "Kumluca",
    "Manavgat",
    "Muratpaşa",
    "Serik",
  ],
  Adana: [
    "Aladağ",
    "Ceyhan",
    "Çukurova",
    "Feke",
    "İmamoğlu",
    "Karaisalı",
    "Karataş",
    "Kozan",
    "Pozantı",
    "Saimbeyli",
    "Sarıçam",
    "Seyhan",
    "Tufanbeyli",
    "Yumurtalık",
    "Yüreğir",
  ],
  Konya: [
    "Ahırlı",
    "Akören",
    "Akşehir",
    "Altınekin",
    "Beyşehir",
    "Bozkır",
    "Cihanbeyli",
    "Çeltik",
    "Çumra",
    "Derbent",
    "Derebucak",
    "Doğanhisar",
    "Emirgazi",
    "Ereğli",
    "Güneysınır",
    "Hadim",
    "Halkapınar",
    "Hüyük",
    "Ilgın",
    "Kadınhanı",
    "Karapınar",
    "Karatay",
    "Kulu",
    "Meram",
    "Sarayönü",
    "Selçuklu",
    "Seydişehir",
    "Taşkent",
    "Tuzlukçu",
    "Yalıhüyük",
    "Yunak",
  ],
  Gaziantep: ["Araban", "İslahiye", "Karkamış", "Nizip", "Nurdağı", "Oğuzeli", "Şahinbey", "Şehitkamil", "Yavuzeli"],
  Kayseri: [
    "Akkışla",
    "Bünyan",
    "Develi",
    "Felahiye",
    "Hacılar",
    "İncesu",
    "Kocasinan",
    "Melikgazi",
    "Özvatan",
    "Pınarbaşı",
    "Sarıoğlan",
    "Sarız",
    "Talas",
    "Tomarza",
    "Yahyalı",
    "Yeşilhisar",
  ],
  Mersin: [
    "Akdeniz",
    "Anamur",
    "Aydıncık",
    "Bozyazı",
    "Çamlıyayla",
    "Erdemli",
    "Gülnar",
    "Mezitli",
    "Mut",
    "Silifke",
    "Tarsus",
    "Toroslar",
    "Yenişehir",
  ],
  Eskişehir: [
    "Alpu",
    "Beylikova",
    "Çifteler",
    "Günyüzü",
    "Han",
    "İnönü",
    "Mahmudiye",
    "Mihalgazi",
    "Mihalıççık",
    "Odunpazarı",
    "Sarıcakaya",
    "Seyitgazi",
    "Sivrihisar",
    "Tepebaşı",
  ],
  Diyarbakır: [
    "Bağlar",
    "Bismil",
    "Çermik",
    "Çınar",
    "Çüngüş",
    "Dicle",
    "Eğil",
    "Ergani",
    "Hani",
    "Hazro",
    "Kayapınar",
    "Kocaköy",
    "Kulp",
    "Lice",
    "Silvan",
    "Sur",
    "Yenişehir",
  ],
  Samsun: [
    "19 Mayıs",
    "Alaçam",
    "Asarcık",
    "Atakum",
    "Ayvacık",
    "Bafra",
    "Canik",
    "Çarşamba",
    "Havza",
    "İlkadım",
    "Kavak",
    "Ladik",
    "Ondokuzmayıs",
    "Salıpazarı",
    "Tekkeköy",
    "Terme",
    "Vezirköprü",
    "Yakakent",
  ],
  Denizli: [
    "Acıpayam",
    "Babadağ",
    "Baklan",
    "Bekilli",
    "Beyağaç",
    "Bozkurt",
    "Buldan",
    "Çal",
    "Çameli",
    "Çardak",
    "Çivril",
    "Güney",
    "Honaz",
    "Kale",
    "Merkezefendi",
    "Pamukkale",
    "Sarayköy",
    "Serinhisar",
    "Tavas",
  ],
  Şanlıurfa: [
    "Akçakale",
    "Birecik",
    "Bozova",
    "Ceylanpınar",
    "Eyyübiye",
    "Halfeti",
    "Haliliye",
    "Harran",
    "Hilvan",
    "Karaköprü",
    "Siverek",
    "Suruç",
    "Viranşehir",
  ],
  Trabzon: [
    "Akçaabat",
    "Araklı",
    "Arsin",
    "Beşikdüzü",
    "Çarşıbaşı",
    "Çaykara",
    "Dernekpazarı",
    "Düzköy",
    "Hayrat",
    "Köprübaşı",
    "Maçka",
    "Of",
    "Ortahisar",
    "Sürmene",
    "Şalpazarı",
    "Tonya",
    "Vakfıkebir",
    "Yomra",
  ],
  Kocaeli: [
    "Başiskele",
    "Çayırova",
    "Darıca",
    "Derince",
    "Dilovası",
    "Gebze",
    "Gölcük",
    "İzmit",
    "Kandıra",
    "Karamürsel",
    "Kartepe",
    "Körfez",
  ],
  Balıkesir: [
    "Altıeylül",
    "Ayvalık",
    "Balya",
    "Bandırma",
    "Bigadiç",
    "Burhaniye",
    "Dursunbey",
    "Edremit",
    "Erdek",
    "Gömeç",
    "Gönen",
    "Havran",
    "İvrindi",
    "Karesi",
    "Kepsut",
    "Manyas",
    "Marmara",
    "Savaştepe",
    "Sındırgı",
    "Susurluk",
  ],
  Malatya: [
    "Akçadağ",
    "Arapgir",
    "Arguvan",
    "Battalgazi",
    "Darende",
    "Doğanşehir",
    "Doğanyol",
    "Hekimhan",
    "Kale",
    "Kuluncak",
    "Pütürge",
    "Yazıhan",
    "Yeşilyurt",
  ],
  Kahramanmaraş: [
    "Afşin",
    "Andırın",
    "Çağlayancerit",
    "Dulkadiroğlu",
    "Ekinözü",
    "Elbistan",
    "Göksun",
    "Nurhak",
    "Onikişubat",
    "Pazarcık",
    "Türkoğlu",
  ],
  Van: [
    "Bahçesaray",
    "Başkale",
    "Çaldıran",
    "Çatak",
    "Edremit",
    "Erciş",
    "Gevaş",
    "Gürpınar",
    "İpekyolu",
    "Muradiye",
    "Özalp",
    "Saray",
    "Tuşba",
  ],
  Batman: ["Beşiri", "Gercüş", "Hasankeyf", "Kozluk", "Merkez", "Sason"],
  Elazığ: [
    "Ağın",
    "Alacakaya",
    "Arıcak",
    "Baskil",
    "Karakoçan",
    "Keban",
    "Kovancılar",
    "Maden",
    "Merkez",
    "Palu",
    "Sivrice",
  ],
  Erzurum: [
    "Aşkale",
    "Aziziye",
    "Çat",
    "Hınıs",
    "Horasan",
    "İspir",
    "Karaçoban",
    "Karayazı",
    "Köprüköy",
    "Narman",
    "Oltu",
    "Olur",
    "Palandöken",
    "Pasinler",
    "Pazaryolu",
    "Şenkaya",
    "Tekman",
    "Tortum",
    "Uzundere",
    "Yakutiye",
  ],
  Sivas: [
    "Akıncılar",
    "Altınyayla",
    "Divriği",
    "Doğanşar",
    "Gemerek",
    "Gölova",
    "Gürün",
    "Hafik",
    "İmranlı",
    "Kangal",
    "Koyulhisar",
    "Merkez",
    "Suşehri",
    "Şarkışla",
    "Ulaş",
    "Yıldızeli",
    "Zara",
  ],
  Manisa: [
    "Ahmetli",
    "Akhisar",
    "Alaşehir",
    "Demirci",
    "Gölmarmara",
    "Gördes",
    "Kırkağaç",
    "Köprübaşı",
    "Kula",
    "Salihli",
    "Sarıgöl",
    "Saruhanlı",
    "Selendi",
    "Soma",
    "Şehzadeler",
    "Turgutlu",
    "Yunusemre",
  ],
  Aydın: [
    "Bozdoğan",
    "Buharkent",
    "Çine",
    "Didim",
    "Efeler",
    "Germencik",
    "İncirliova",
    "Karacasu",
    "Karpuzlu",
    "Koçarlı",
    "Köşk",
    "Kuşadası",
    "Kuyucak",
    "Nazilli",
    "Söke",
    "Sultanhisar",
    "Yenipazar",
  ],
  Tekirdağ: [
    "Çerkezköy",
    "Çorlu",
    "Ergene",
    "Hayrabolu",
    "Kapaklı",
    "Malkara",
    "Marmaraereğlisi",
    "Muratlı",
    "Saray",
    "Süleymanpaşa",
    "Şarköy",
  ],
  Sakarya: [
    "Adapazarı",
    "Akyazı",
    "Arifiye",
    "Erenler",
    "Ferizli",
    "Geyve",
    "Hendek",
    "Karapürçek",
    "Karasu",
    "Kaynarca",
    "Kocaali",
    "Pamukova",
    "Sapanca",
    "Serdivan",
    "Söğütlü",
    "Taraklı",
  ],
  Muğla: [
    "Bodrum",
    "Dalaman",
    "Datça",
    "Fethiye",
    "Kavaklıdere",
    "Köyceğiz",
    "Marmaris",
    "Menteşe",
    "Milas",
    "Ortaca",
    "Seydikemer",
    "Ula",
    "Yatağan",
  ],
  Mardin: ["Artuklu", "Dargeçit", "Derik", "Kızıltepe", "Mazıdağı", "Midyat", "Nusaybin", "Ömerli", "Savur", "Yeşilli"],
  Afyonkarahisar: [
    "Başmakçı",
    "Bayat",
    "Bolvadin",
    "Çay",
    "Çobanlar",
    "Dazkırı",
    "Dinar",
    "Emirdağ",
    "Evciler",
    "Hocalar",
    "İhsaniye",
    "İscehisar",
    "Kızılören",
    "Merkez",
    "Sandıklı",
    "Sinanpaşa",
    "Sultandağı",
    "Şuhut",
  ],
  Ordu: [
    "Akkuş",
    "Altınordu",
    "Aybastı",
    "Çamaş",
    "Çatalpınar",
    "Çaybaşı",
    "Fatsa",
    "Gölköy",
    "Gülyalı",
    "Gürgentepe",
    "İkizce",
    "Kabadüz",
    "Kabataş",
    "Korgan",
    "Kumru",
    "Mesudiye",
    "Perşembe",
    "Piraziz",
    "Ulubey",
    "Ünye",
  ],
  Giresun: [
    "Alucra",
    "Bulancak",
    "Çamoluk",
    "Çanakçı",
    "Dereli",
    "Doğankent",
    "Espiye",
    "Eynesil",
    "Görele",
    "Güce",
    "Keşap",
    "Merkez",
    "Piraziz",
    "Şebinkarahisar",
    "Tirebolu",
    "Yağlıdere",
  ],
  Hatay: [
    "Altınözü",
    "Antakya",
    "Arsuz",
    "Belen",
    "Defne",
    "Dörtyol",
    "Erzin",
    "Hassa",
    "İskenderun",
    "Kırıkhan",
    "Kumlu",
    "Payas",
    "Reyhanlı",
    "Samandağ",
    "Yayladağı",
  ],
  Rize: [
    "Ardeşen",
    "Çamlıhemşin",
    "Çayeli",
    "Derepazarı",
    "Fındıklı",
    "Güneysu",
    "Hemşin",
    "İkizdere",
    "İyidere",
    "Kalkandere",
    "Merkez",
    "Pazar",
  ],
  Bolu: ["Dörtdivan", "Gerede", "Göynük", "Kıbrıscık", "Mengen", "Merkez", "Mudurnu", "Seben", "Yeniçağa"],
  Tokat: [
    "Almus",
    "Artova",
    "Başçiftlik",
    "Erbaa",
    "Merkez",
    "Niksar",
    "Pazar",
    "Reşadiye",
    "Sulusaray",
    "Turhal",
    "Yeşilyurt",
    "Zile",
  ],
  Çorum: [
    "Alaca",
    "Bayat",
    "Boğazkale",
    "Dodurga",
    "İskilip",
    "Kargı",
    "Laçin",
    "Mecitözü",
    "Merkez",
    "Oğuzlar",
    "Ortaköy",
    "Osmancık",
    "Sungurlu",
    "Uğurludağ",
  ],
  Sinop: ["Ayancık", "Boyabat", "Dikmen", "Durağan", "Erfelek", "Gerze", "Merkez", "Saraydüzü", "Türkeli"],
  Yozgat: [
    "Akdağmadeni",
    "Aydıncık",
    "Boğazlıyan",
    "Çandır",
    "Çayıralan",
    "Çekerek",
    "Kadışehri",
    "Merkez",
    "Saraykent",
    "Sarıkaya",
    "Sorgun",
    "Şefaatli",
    "Yenifakılı",
    "Yerköy",
  ],
  Çanakkale: [
    "Ayvacık",
    "Bayramiç",
    "Biga",
    "Bozcaada",
    "Çan",
    "Eceabat",
    "Ezine",
    "Gelibolu",
    "Gökçeada",
    "Lapseki",
    "Merkez",
    "Yenice",
  ],
  Kırklareli: ["Babaeski", "Demirköy", "Kofçaz", "Lüleburgaz", "Merkez", "Pehlivanköy", "Pınarhisar", "Vize"],
  Edirne: ["Enez", "Havsa", "İpsala", "Keşan", "Lalapaşa", "Meriç", "Merkez", "Süloğlu", "Uzunköprü"],
  Uşak: ["Banaz", "Eşme", "Karahallı", "Merkez", "Sivaslı", "Ulubey"],
  Düzce: ["Akçakoca", "Cumayeri", "Çilimli", "Gölyaka", "Gümüşova", "Kaynaşlı", "Merkez", "Yığılca"],
  Osmaniye: ["Bahçe", "Düziçi", "Hasanbeyli", "Kadirli", "Merkez", "Sumbas", "Toprakkale"],
  Kırıkkale: ["Bahşılı", "Balışeyh", "Çelebi", "Delice", "Karakeçili", "Keskin", "Merkez", "Sulakyurt", "Yahşihan"],
  Kırşehir: ["Akçakent", "Akpınar", "Boztepe", "Çiçekdağı", "Kaman", "Merkez", "Mucur"],
  Nevşehir: ["Acıgöl", "Avanos", "Derinkuyu", "Gülşehir", "Hacıbektaş", "Kozaklı", "Merkez", "Ürgüp"],
  Niğde: ["Altunhisar", "Bor", "Çamardı", "Çiftlik", "Merkez", "Ulukışla"],
  Kütahya: [
    "Altıntaş",
    "Aslanapa",
    "Çavdarhisar",
    "Domaniç",
    "Dumlupınar",
    "Emet",
    "Gediz",
    "Hisarcık",
    "Merkez",
    "Pazarlar",
    "Simav",
    "Şaphane",
    "Tavşanlı",
  ],
  Amasya: ["Göynücek", "Gümüşhacıköy", "Hamamözü", "Merkez", "Merzifon", "Suluova", "Taşova"],
  Kastamonu: [
    "Abana",
    "Ağlı",
    "Araç",
    "Azdavay",
    "Bozkurt",
    "Cide",
    "Çatalzeytin",
    "Daday",
    "Devrekani",
    "Doğanyurt",
    "Hanönü",
    "İhsangazi",
    "İnebolu",
    "Küre",
    "Merkez",
    "Pınarbaşı",
    "Seydiler",
    "Şenpazar",
    "Taşköprü",
    "Tosya",
  ],
  Zonguldak: ["Alaplı", "Çaycuma", "Devrek", "Gökçebey", "Kilimli", "Kozlu", "Merkez"],
  Isparta: [
    "Aksu",
    "Atabey",
    "Eğirdir",
    "Gelendost",
    "Gönen",
    "Keçiborlu",
    "Merkez",
    "Senirkent",
    "Sütçüler",
    "Şarkikaraağaç",
    "Uluborlu",
    "Yalvaç",
    "Yenişarbademli",
  ],
  Burdur: [
    "Ağlasun",
    "Altınyayla",
    "Bucak",
    "Çavdir",
    "Çeltikçi",
    "Gölhisar",
    "Karamanlı",
    "Kemer",
    "Merkez",
    "Tefenni",
    "Yeşilova",
  ],
  Bilecik: ["Bozüyük", "Gölpazarı", "İnhisar", "Merkez", "Osmaneli", "Pazaryeri", "Söğüt", "Yenipazar"],
  Artvin: ["Ardanuç", "Arhavi", "Borçka", "Hopa", "Merkez", "Murgul", "Şavşat", "Yusufeli"],
  Yalova: ["Altınova", "Armutlu", "Çınarcık", "Çiftlikköy", "Merkez", "Termal"],
  Karabük: ["Eflani", "Eskipazar", "Merkez", "Ovacık", "Safranbolu", "Yenice"],
  Kilis: ["Elbeyli", "Merkez", "Musabeyli", "Polateli"],
  Şırnak: ["Beytüşşebap", "Cizre", "Güçlükonak", "İdil", "Merkez", "Silopi", "Uludere"],
  Bartın: ["Amasra", "Kurucaşile", "Merkez", "Ulus"],
  Ardahan: ["Çıldır", "Damal", "Göle", "Hanak", "Merkez", "Posof"],
  Iğdır: ["Aralık", "Karakoyunlu", "Merkez", "Tuzluca"],
  Karaman: ["Ayrancı", "Başyayla", "Ermenek", "Kazımkarabekir", "Merkez", "Sarıveliler"],
  Aksaray: ["Ağaçören", "Eskil", "Gülağaç", "Güzelyurt", "Merkez", "Ortaköy", "Sarıyahşi"],
  Bayburt: ["Aydıntepe", "Demirözü", "Merkez"],
  Gümüşhane: ["Kelkit", "Köse", "Kürtün", "Merkez", "Şiran", "Torul"],
  Hakkari: ["Çukurca", "Merkez", "Şemdinli", "Yüksekova"],
  Muş: ["Bulanık", "Hasköy", "Korkut", "Malazgirt", "Merkez", "Varto"],
  Bitlis: ["Adilcevaz", "Ahlat", "Güroymak", "Hizan", "Merkez", "Mutki", "Tatvan"],
  Bingöl: ["Adaklı", "Genç", "Karlıova", "Kiğı", "Merkez", "Solhan", "Yayladere", "Yedisu"],
  Tunceli: ["Çemişgezek", "Hozat", "Mazgirt", "Merkez", "Nazımiye", "Ovacık", "Pertek", "Pülümür"],
  Siirt: ["Baykan", "Eruh", "Kurtalan", "Merkez", "Pervari", "Şirvan"],
  Ağrı: ["Diyadin", "Doğubayazıt", "Eleşkirt", "Hamur", "Merkez", "Patnos", "Taşlıçay", "Tutak"],
  Adıyaman: ["Besni", "Çelikhan", "Gerger", "Gölbaşı", "Kahta", "Merkez", "Samsat", "Sincik", "Tut"],
}

export default function RegisterPage() {
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [address, setAddress] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [companyTaxNumber, setCompanyTaxNumber] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")
  const [isPersonalUse, setIsPersonalUse] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [showVerificationInput, setShowVerificationInput] = useState(false)
  const [verificationLoading, setVerificationLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleCityChange = (selectedCity: string) => {
    setCity(selectedCity)
    setDistrict("") // İl değiştiğinde ilçeyi sıfırla
  }

  const getDistrictsForCity = (selectedCity: string): string[] => {
    return cityDistricts[selectedCity] || []
  }

  const formatPhoneNumber = (phone: string) => {
    // Türkiye telefon numarası formatı: +90XXXXXXXXXX
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.startsWith("0")) {
      return "+90" + cleaned.substring(1)
    } else if (cleaned.startsWith("90")) {
      return "+" + cleaned
    } else if (cleaned.length === 10) {
      return "+90" + cleaned
    }
    return phone
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    if (isPhoneVerified) {
      setIsPhoneVerified(false)
      setShowVerificationInput(false)
      setVerificationCode("")
    }
  }

  const handleSendVerification = async () => {
    if (!phone.trim()) {
      setError("Telefon numaranızı girin")
      return
    }

    const formattedPhone = formatPhoneNumber(phone)
    if (formattedPhone.length !== 13) {
      setError("Geçerli bir telefon numarası girin")
      return
    }

    setVerificationLoading(true)
    setError("")

    try {
      const response = await fetch("/api/send-verification-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formattedPhone,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setShowVerificationInput(true)
        setMessage("Doğrulama kodu gönderildi")
      } else {
        setError(data.error || "SMS gönderilemedi")
      }
    } catch (err) {
      console.error("[v0] SMS send error:", err)
      setError("SMS gönderimi sırasında hata oluştu")
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError("Doğrulama kodunu girin")
      return
    }

    setVerificationLoading(true)
    setError("")

    try {
      console.log("[v0] Starting code verification for phone:", formatPhoneNumber(phone))
      console.log("[v0] Verification code entered:", verificationCode)

      const response = await fetch("/api/verify-sms-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: formatPhoneNumber(phone),
          code: verificationCode,
        }),
      })

      const data = await response.json()
      console.log("[v0] Verification API response:", { status: response.status, data })

      if (response.ok) {
        console.log("[v0] Verification successful - setting isPhoneVerified to true")
        setIsPhoneVerified(true)
        setMessage("Telefon numaranız doğrulandı ✓")
        setShowVerificationInput(false)
        console.log("[v0] Phone verification state updated")
      } else {
        console.log("[v0] Verification failed:", data.error)
        setError(data.error || "Doğrulama kodu hatalı")
      }
    } catch (err) {
      console.error("[v0] Verification error:", err)
      setError("Doğrulama sırasında hata oluştu")
    } finally {
      setVerificationLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phone.trim()) {
      setError("Telefon numaranız gereklidir")
      return
    }

    if (!isPhoneVerified) {
      setError("Önce telefon numaranızı doğrulayın")
      return
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor")
      return
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır")
      return
    }

    if (!fullName.trim()) {
      setError("Ad soyad gereklidir")
      return
    }

    if (!email.trim()) {
      setError("Email adresi gereklidir")
      return
    }

    if (!city) {
      setError("İl seçimi gereklidir")
      return
    }

    if (!district) {
      setError("İlçe seçimi gereklidir")
      return
    }

    if (!isPersonalUse && !companyName.trim()) {
      setError("Şirket adı gereklidir")
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    try {
      console.log("[v0] Starting user registration process")

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            email_verified: true, // Mark email as verified in metadata
          },
        },
      })

      console.log("[v0] Supabase signup response:", { authData, authError })

      if (authError) {
        console.error("[v0] Auth signup error details:", {
          message: authError.message,
          status: authError.status,
          name: authError.name,
          cause: authError.cause,
        })

        if (
          authError.message.includes("User already registered") ||
          authError.message.includes("already been registered")
        ) {
          setError("Bu email adresi zaten kayıtlı. Giriş yapmayı deneyin.")
        } else if (authError.message.includes("Invalid email")) {
          setError("Geçersiz email adresi formatı")
        } else if (authError.message.includes("Password") || authError.message.includes("password")) {
          setError("Şifre çok zayıf. En az 6 karakter kullanın.")
        } else {
          setError("Kayıt başarısız: " + authError.message)
        }
        return
      }

      if (authData.user) {
        console.log("[v0] Registration successful - user created:", authData.user.id)

        try {
          const profileData = {
            id: authData.user.id,
            email: authData.user.email,
            full_name: fullName,
            phone: formatPhoneNumber(phone),
            username: email.split("@")[0],
            city: city,
            district: district,
            address: address || "",
            company_name: isPersonalUse ? "Kişisel Kullanım" : companyName,
            company_address: companyAddress || "",
            company_tax_number: companyTaxNumber || "",
            company_website: companyWebsite || "",
            account_type: isPersonalUse ? "personal" : "company",
            role: "user",
          }

          console.log("[v0] Creating profile via API with data:", profileData)

          const profileResponse = await fetch("/api/create-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(profileData),
          })

          const profileResult = await profileResponse.json()

          if (!profileResponse.ok) {
            console.error("[v0] Profile creation error via API:", profileResult)
            setMessage("Hesabınız başarıyla oluşturuldu! Profil bilgileriniz güncellenecek. Giriş yapabilirsiniz.")
          } else {
            console.log("[v0] Profile operation successful:", profileResult)
            if (profileResult.action === "updated") {
              setMessage("Hesabınız başarıyla oluşturuldu! Mevcut profil bilgileriniz güncellendi.")
            } else {
              setMessage("Hesabınız ve profiliniz başarıyla oluşturuldu!")
            }
          }
        } catch (profileErr) {
          console.error("[v0] Profile creation API exception:", profileErr)
          setMessage("Hesabınız başarıyla oluşturuldu! Giriş yaparak profilinizi tamamlayabilirsiniz.")
        }

        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        console.error("[v0] No user data returned from signup")
        setError("Kayıt işlemi tamamlanamadı. Lütfen tekrar deneyin.")
      }
    } catch (err) {
      console.error("[v0] Registration error:", err)

      if (err instanceof Error) {
        console.error("[v0] Error details:", {
          name: err.name,
          message: err.message,
          stack: err.stack,
        })

        if (err.message.includes("fetch")) {
          setError("Bağlantı hatası. İnternet bağlantınızı kontrol edin.")
        } else {
          setError("Kayıt sırasında hata: " + err.message)
        }
      } else {
        console.error("[v0] Unknown error type:", typeof err, err)
        setError("Kayıt sırasında beklenmeyen bir hata oluştu")
      }
    } finally {
      setLoading(false)
    }
  }

  const shouldShowVerificationButton = () => {
    const cleaned = phone.replace(/\D/g, "")
    return cleaned.length >= 10 && !isPhoneVerified && !showVerificationInput
  }

  return (
    <div className="min-h-screen bg-background digital-grid relative">
      <div className="circuit-pattern absolute inset-0 pointer-events-none" />

      <Navigation />

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <Card className="hologram-card shadow-2xl shadow-neon-blue/20">
            <CardHeader className="space-y-4 text-center px-4 sm:px-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-neon-blue to-neon-purple rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-neon-blue/40">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold neon-text">Hesap Oluştur</CardTitle>
              <CardDescription className="text-base sm:text-lg text-foreground/80">
                WhatsApp Yapay Zeka Otomasyonu platformuna katılın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4 sm:px-6">
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-neon-cyan border-b border-neon-cyan/30 pb-2">
                    Kişisel Bilgiler
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-foreground font-medium text-sm">
                        Ad Soyad
                      </Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Adınız ve soyadınız"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium text-sm">
                        Email Adresi
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground font-medium text-sm">
                        Telefon Numarası
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="05XXXXXXXXX"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base"
                        required
                      />
                      <p className="text-xs text-muted-foreground">Türkiye telefon numarası formatında girin</p>

                      {shouldShowVerificationButton() && (
                        <Button
                          type="button"
                          onClick={handleSendVerification}
                          disabled={verificationLoading}
                          className="w-full mt-2 bg-neon-purple hover:bg-neon-purple/80 text-white text-sm sm:text-base"
                        >
                          {verificationLoading ? "Kod Gönderiliyor..." : "Doğrulama Kodu Gönder"}
                        </Button>
                      )}

                      {showVerificationInput && (
                        <div className="space-y-2 mt-2">
                          <Input
                            type="text"
                            placeholder="6 haneli doğrulama kodu"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base"
                            maxLength={6}
                          />
                          <Button
                            type="button"
                            onClick={handleVerifyCode}
                            disabled={verificationLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white text-sm sm:text-base"
                          >
                            {verificationLoading ? "Doğrulanıyor..." : "Kodu Doğrula"}
                          </Button>
                        </div>
                      )}

                      {isPhoneVerified && (
                        <div className="flex items-center space-x-2 mt-2 text-green-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm">Telefon numaranız doğrulandı</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-foreground font-medium text-sm">
                        İl
                      </Label>
                      <Select value={city} onValueChange={handleCityChange} required>
                        <SelectTrigger className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base">
                          <SelectValue placeholder="İl seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {turkishCities.map((cityName) => (
                            <SelectItem key={cityName} value={cityName}>
                              {cityName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {city && (
                    <div className="space-y-2">
                      <Label htmlFor="district" className="text-foreground font-medium text-sm">
                        İlçe
                      </Label>
                      <Select value={district} onValueChange={setDistrict} required>
                        <SelectTrigger className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base">
                          <SelectValue placeholder="İlçe seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                          {getDistrictsForCity(city).map((districtName) => (
                            <SelectItem key={districtName} value={districtName}>
                              {districtName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-foreground font-medium text-sm">
                      Adres
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder="Tam adresiniz"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="personalUse" checked={isPersonalUse} onCheckedChange={setIsPersonalUse} />
                  <Label htmlFor="personalUse" className="text-sm text-foreground">
                    Kişisel kullanım için kayıt oluyorum
                  </Label>
                </div>

                {!isPersonalUse && (
                  <div className="space-y-4">
                    <h3 className="text-base sm:text-lg font-semibold text-neon-purple border-b border-neon-purple/30 pb-2">
                      Şirket Bilgileri
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName" className="text-foreground font-medium text-sm">
                          Şirket Adı *
                        </Label>
                        <Input
                          id="companyName"
                          type="text"
                          placeholder="Şirket adınız"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base"
                          required={!isPersonalUse}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyWebsite" className="text-foreground font-medium text-sm">
                          Şirket Web Sitesi
                        </Label>
                        <Input
                          id="companyWebsite"
                          type="url"
                          placeholder="https://www.sirketiniz.com"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyAddress" className="text-foreground font-medium text-sm">
                          Şirket Adresi
                        </Label>
                        <Input
                          id="companyAddress"
                          type="text"
                          placeholder="Şirket adresiniz"
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="companyTaxNumber" className="text-foreground font-medium text-sm">
                          Vergi Numarası
                        </Label>
                        <Input
                          id="companyTaxNumber"
                          type="text"
                          placeholder="10 haneli vergi numarası"
                          value={companyTaxNumber}
                          onChange={(e) => setCompanyTaxNumber(e.target.value)}
                          className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base"
                          maxLength={10}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-tech-orange border-b border-tech-orange/30 pb-2">
                    Güvenlik
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground font-medium text-sm">
                        Şifre
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="En az 6 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base"
                        required
                        minLength={6}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-foreground font-medium text-sm">
                        Şifre Tekrar
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Şifrenizi tekrar girin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-background/50 border-border/50 focus:border-neon-cyan text-sm sm:text-base"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {message && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <AlertDescription className="text-green-400 text-sm">{message}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full tech-button text-white font-bold py-3 text-base sm:text-lg shadow-2xl shadow-neon-blue/30"
                  disabled={loading || !isPhoneVerified}
                >
                  {loading ? "Hesap Oluşturuluyor..." : "Üyelik Tamamla"}
                </Button>
              </form>

              <div className="text-center pt-6 border-t border-border/30">
                <p className="text-muted-foreground text-sm">
                  Zaten hesabınız var mı?{" "}
                  <Link
                    href="/auth/login"
                    className="text-neon-cyan hover:text-neon-cyan/80 font-medium transition-colors"
                  >
                    Giriş Yap
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
