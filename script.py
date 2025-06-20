from prompt_toolkit import PromptSession
from prompt_toolkit.completion import WordCompleter
key = {"8bit":["Penny","Brock","Squeak", "Piper"],
        "Amber": [ "Carl", "Crow", "Piper", "Belle", "Pam"],
        "Angelo": ["Kit", "Max", "Nani"],
        "Ash": ["Rosa", "Frank", "Bull", "Surge", "T>Anti-Tanks"],
        "Barley": ["Mico", "Kenji", "Edgar", "Mortis", "T>Assassins"],
        "Bea": ["Piper", "Sprout", "Mr. P", "T>Throwers"],
        "Belle": ["Nani", "Darryl", "Piper"],
        "Berry": ["Barley", "Kenji", "Mortis", "T>Assassins"],
        "Bibi": ["Surge", "El Primo", "Cordelius", "Shelly"],
        "Bo": ["Piper", "Stu", "Max", "Leon"],
        "Bonnie": ["Piper", "Darryl", "RT", "Colette"],
        "Brock": ["Max", "Nani", "Piper", "Mandy"],
        "Bull": ["Nita", "Griff", "Gale", "T>Anti-tanks"],
        "Buster": ["Rosa", "Darryl", "Jacky", "Buzz", "Primo"],
        "Buzz": ["Surge", "Gale", "Jacky"],
        "Byron": ["Piper", "Lou", "Sprout"],
        "Carl": ["Buzz", "Surge", "Darryl", "Jacky", "Gene"],
        "Charlie": ["Penny", "Barley", "Sandy", "Juju", "Larry"],
        "Chester": ["Janet", "Amber", "Stu", "Gale"],
        "Chuck": ["Cordelius", "Bull", "Angelo", "Clancy", "Melodie"],
        "Clancy": ["Belle", "Tara", "Penny"],
        "Colette": ["Belle", "Stu", "Bea", "Griff", "Jessie"],
        "Colt": ["Piper", "Belle", "Gus"],
        "Cordelius": ["Frank", "Buster", "Surge", "Nita"],
        "Crow": ["Piper", "Spike", "T>Tanks"],
        "Darryl": ["Cordelius", "Otis", "Clancy"],
        "Doug": ["Frank", "Clancy", "Griff"],
        "Draco": ["Lou", "Nita", "Frank"],
        "Dynamike": ["Mico", "Mortis", "Kenji", "Edgar"],
        "Edgar": ["Surge", "Doug", "Jacky", "Shelly"],
        "El Primo": ["Cordelius", "Gale", "Shelly"],
        "Emz": ["Mortis", "Barley", "Juju", "Larry", "Janet"],
        "Eve": ["Piper", "Penny", "Janet", "Max"],
        "Fang": ["Clancy", "Otis", "Shelly", "Gale"],
        "Frank": ["Collete", "Primo", "Griff", "Chester"],
        "Gale": ["Janet", "Amber", "T>Thrower", "Penny"],
        "Gene": ["Mr P", "Penny", "Tara", "Eve", "Charlie", "Bell"],
        "Gray": ["Mr P", "Charlie", "Gus"],
        "Griff": ["Lola", "Stu", "Bea"],
        "Grom": ["Mico", "Mortis", "T>Assassins"],
        "Gus": ["Piper", "Mr P", "Darryl"],
        "Hank": ["Dynamike", "Frank", "Gale"],
        "Jacky": ["Frank", "Gale", "Rosa"],
        "Janet": ["Frank", "Carl", "Kenji", "Bell"],
        "Jesse": ["T>Thrower", "Bell", "Squeak"],
        "Juju": ["Frank", "Tick", "Larry", "T>Wallbreaker"],
        "Kenji": ["Frank", "Draco", "Primo"],
        "Kit": ["Charlie", "Cordelius", "RT", "Chester"],
        "Larry": ["Tick", "Edgar", "Kenji"],
        "Leon": ["Crow", "Stu", "Pearl"],
        "Lily": ["RT", "Jacky", "Bull", "Shelly"],
        "Lola": ["Bell", "Penny", "Amber"],
        "Lou": ["Bell", "Bea", "Bo", "Poco", "T>Thrower"],
        "Maisie": ["Barley", "Stu", "Bell", "Penny"],
        "Mandy": ["Nani", "Tick", "Mortis", "T>Thrower"],
        "Max": ["Crow", "Gus", "Pam", "Stu"],
        "Meple": ["Kenji", "Frank", "Ash"],
        "Meg": ["Colette", "Lou", "Lola", "Bea"],
        "Melodie": ["Clancy", "Cordelius", "Buzz"],
        "Mico": ["RT", "Bull", "Stu"],
        "Moe": ["Penny", "Darryl", "Larry"],
        "Mortis": ["Jacky", "Shade", "Bull", "Gale", "Shelly"],
        "Mr P": ["Edgar", "Mortis", "Bibi"],
        "Nani": ["Gene", "Max", "Darryl", "Tick"],
        "Nita": ["Barley", "Juju", "Larry", "Spike", "Griff"],
        "Otis": ["Barley", "Juju", "Larry", "Stu", "Amber"],
        "Pam": ["Jesse", "Lou", "8Bit", "Collete"],
        "Pearl": ["Lou", "8Bit", "Buster"],
        "Penny": ["T>Thrower", "Squeak", "Kenji", "Bo"],
        "Piper": ["Nani", "Tick", "Kit", "Kenji"],
        "Poco": ["Emz", "Mortis", "Jesse"],
        "RT": ["T>Thrower", "Gus", "Max", "Bo"],
        "Rico": ["T>Thrower", "Brock", "Piper", "Stu"],
        "Rosa": ["Shelly", "Emz", "Frank"],
        "Ruffs": ["Buzz", "Carl", "Sprout", "T>Assassins"],
        "Sam": ["Surge", "Lou", "Griff"],
        "Sandy": ["Nita", "Janet", "Kenji", "Larry"],
        "Shade": ["Frank", "Lou", "Jacky"],
        "Shelly": ["Stu", "Nita", "Spike", "Penny"],
        "Spike": ["T>Thrower", "Squeak", "Carl", "Piper"],
        "Sprout": ["Mico", "Mortis", "Edgar", "Frank"],
        "Squeak": ["T>Assasins", "Ash", "Kenji", "Mortis", "Buzz"],
        "Stu": ["T>Healer", "T>Sniper", "Ruffs", "Penny", "Sandy", "Poco", "Belle"],
        "Surge": ["T>Thrower", "Ruffs", "Tara", "Charlie", "Spike"],
        "Tara": ["T>Thrower", "Otis", "Sandy", "Janet"],
        "Tick": ["Mico", "Mortis", "Darryl", "Bibi"],
        "Willow": ["Barley", "Larry", "Buzz"]
}
brawlers = list(key.keys())
extra_commands  = ["done", "submit"]
class DynamicCompleter(WordCompleter):
    def __init__(self, words, **kwargs):
        super().__init__(words, ignore_case=True, **kwargs)

    def get_completions(self, document, complete_event):
        remaining = [w for w in brawlers + extra_commands if w not in selected]
        self.words = remaining
        yield from super().get_completions(document, complete_event)

selected = set()
session  = PromptSession(completer=DynamicCompleter(brawlers + extra_commands, sentence=True),complete_while_typing=True)
brawlerCounts = {}
def countBrawler(name):
    brawlerCounts[name] = brawlerCounts.get(name, 0) + 1

def returnBrawlerString(name, counterclasses=True):
    brawlerList=[]
    counterClass = "Counter Classes: "
    count = 0
    for counter in key[name.title()]:
        if "T>" in counter:
            counterClass += (", " * count) + counter[2:]
            count+=1
            continue
        brawlerList.append(counter)
    return "--------------------------------------------\n" + name.title() + " Counters: " + ", ".join(brawlerList) + (("\n" + counterClass) * (count>0) * counterclasses) + "\n--------------------------------------------"
def handleCases(name):
    if "primo" in name.lower():
        return "El Primo"
    if "miko" in name.lower():
        return "Mico"
    if "mike" in name.lower():
        return "Dynamike"
    if "barry" in name.lower():
        return "Berry"
    return name
def main():
    print("--------------------------------------------\nWelcome to Brawler Counterpick Calculator!\nEnter up to three brawlers, or \"done\" to submit.\n--------------------------------------------")
    brawlerList = []
    i = 1
    while(i < 4):
        brawler = handleCases(session.prompt(f"Brawler {i}: ").strip()).title()
        if brawler.lower() in {"done", "submit"}:
            break
        if brawler in selected:
            print("You've already added " + brawler.title() + ", please enter a new one or type \"done\".")
            continue
        if brawler not in key:
            print("Please type a correct brawler name.")
            continue
        selected.add(brawler)
        brawlerList.append(brawler)
        for brawler in key[brawler]:
            countBrawler(brawler)
        i+=1
    for brawler in brawlerList:
        print(returnBrawlerString(brawler, False))
    doubleOverlap = []
    tripleOverlap = []
    for brawler in brawlerCounts:
        if brawlerCounts[brawler] == 2:
            doubleOverlap.append(brawler)
            continue
        if brawlerCounts[brawler] == 3:
            tripleOverlap.append(brawler)
    print("--------------------------------------------\n\n" * (len(doubleOverlap) + len(tripleOverlap) > 0), end="") 
    if len(doubleOverlap) > 0: print(("Double Overlaps: "+ ", ".join(doubleOverlap)))
    if len(tripleOverlap) > 0: print(("Triple Overlaps: " + ", ".join(tripleOverlap)), end="\n")
    print("\n--------------------------------------------" * (len(doubleOverlap) + len(tripleOverlap) > 0), end="")

if __name__ == "__main__":
    main()