import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { generateRecipe, generateRecipeModification } from "@/lib/gemini";
import { RecipeDisplay } from "./RecipeDisplay";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatInputProps {
  onRecipeChange?: (recipe: string | null) => void;
}

export function ChatInput({ onRecipeChange }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [equipment, setEquipment] = useState("");
  const [experience, setExperience] = useState("beginner");
  const [exclusions, setExclusions] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [cookTime, setCookTime] = useState(15);
  const [dietaryGoal, setDietaryGoal] = useState("");
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [modifications, setModifications] = useState<
    Array<{
      request: string;
      response: string | null;
      timestamp: Date;
    }>
  >([]);
  const [isProcessingMod, setIsProcessingMod] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [modifications]);

  const handleTimeChange = (value: number[]) => {
    setCookTime(Math.max(15, value[0]));
  };

  const handleServingsChange = (value: number[]) => {
    setServings(Math.max(1, value[0]));
  };

  const handleGenerateRecipe = async () => {
    try {
      setIsLoading(true);
      const response = await generateRecipe({
        ingredients: input,
        experience,
        cookTime,
        servings,
        cuisine,
        mealType,
        dietaryGoal,
        exclusions,
        equipment,
      });
      setRecipe(response);
      onRecipeChange?.(response);
      console.log(response);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModification = async (input: string) => {
    const newModification = {
      request: input,
      response: null,
      timestamp: new Date(),
    };
    setModifications((prev) => [...prev, newModification]);
    setNotes("");

    setIsProcessingMod(true);
    try {
      const response = await generateRecipeModification({
        originalRecipe: recipe!,
        modification: input,
      });

      setModifications((prev) =>
        prev.map((mod, index) =>
          index === prev.length - 1 ? { ...mod, response } : mod
        )
      );

      setRecipe(response);
      onRecipeChange?.(response);
    } catch (error) {
      console.error("Error processing modification:", error);
    } finally {
      setIsProcessingMod(false);
    }
  };

  return (
    <div className="h-full">
      {!recipe ? (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="grid grid-cols-1 gap-8 p-6">
              {/* Experience Level Section */}
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Experience Level</CardTitle>
                  <CardDescription>
                    Select your comfort level in the kitchen to get personalized
                    recipe suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    defaultValue="beginner"
                    value={experience}
                    onValueChange={setExperience}
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="beginner">Beginner Cook</TabsTrigger>
                      <TabsTrigger value="intermediate">Home Chef</TabsTrigger>
                      <TabsTrigger value="advanced">Professional</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Time and Servings in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 col-span-1 md:col-span-2">
                {/* Time Constraints */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Time Available</CardTitle>
                    <CardDescription>
                      How much time do you have to cook?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={cookTime <= 15}
                          onClick={() =>
                            setCookTime((prev) => Math.max(15, prev - 5))
                          }
                        >
                          -
                        </Button>
                        <div className="text-lg min-w-[120px] text-center">
                          <span className="font-bold">{cookTime}</span>{" "}
                          <span className="text-muted-foreground">minutes</span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={cookTime >= 180}
                          onClick={() =>
                            setCookTime((prev) => Math.min(180, prev + 5))
                          }
                        >
                          +
                        </Button>
                      </div>
                      <Slider
                        value={[cookTime]}
                        onValueChange={handleTimeChange}
                        min={0}
                        max={180}
                        step={5}
                        className="pt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Serving Size */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle>Serving Size</CardTitle>
                    <CardDescription>
                      How many people are you cooking for?
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={servings <= 1}
                          onClick={() =>
                            setServings((prev) => Math.max(1, prev - 1))
                          }
                        >
                          -
                        </Button>
                        <div className="text-lg min-w-[120px] text-center">
                          <span className="font-bold">{servings}</span>{" "}
                          <span className="text-muted-foreground">
                            {servings === 1 ? "person" : "people"}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={servings >= 18}
                          onClick={() =>
                            setServings((prev) => Math.min(18, prev + 1))
                          }
                        >
                          +
                        </Button>
                      </div>
                      <Slider
                        value={[servings]}
                        onValueChange={handleServingsChange}
                        min={0}
                        max={18}
                        step={1}
                        className="pt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ingredients Section */}
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                  <CardDescription>
                    List your ingredients with approximate amounts - don't worry
                    about being too precise!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g., 2 chicken breasts, a bag of rice, some carrots, onions..."
                    className="flex-1 min-h-[120px] resize-none"
                  />
                </CardContent>
              </Card>

              {/* Additional Settings Collapsible */}
              <Collapsible
                open={isOpen}
                onOpenChange={setIsOpen}
                className="w-full space-y-2 col-span-1 md:col-span-2"
              >
                <div className="px-4">
                  <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-80">
                    <h4 className="text-sm font-semibold text-foreground">
                      Optional Extra Inputs
                    </h4>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Cuisine Preferences */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          Cuisine Preferences
                          <span className="text-sm font-normal text-muted-foreground">
                            (Optional)
                          </span>
                        </CardTitle>
                        <CardDescription>
                          Describe your preferred style of cooking or specific
                          cuisines you'd like to explore
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={cuisine}
                          onChange={(e) => setCuisine(e.target.value)}
                          placeholder="e.g., I love spicy Indian food, or I'd like to try making authentic Italian pasta..."
                          className="flex-1 min-h-[100px] resize-none"
                        />
                      </CardContent>
                    </Card>

                    {/* Meal Type */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          Meal Type
                          <span className="text-sm font-normal text-muted-foreground">
                            (Optional)
                          </span>
                        </CardTitle>
                        <CardDescription>
                          Describe what kind of meal you're planning to make and
                          its context
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={mealType}
                          onChange={(e) => setMealType(e.target.value)}
                          placeholder="e.g., Post-workout dinner, light lunch for work, weekend brunch with friends..."
                          className="flex-1 min-h-[100px] resize-none"
                        />
                      </CardContent>
                    </Card>

                    {/* Dietary Goals */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          Dietary Goals
                          <span className="text-sm font-normal text-muted-foreground">
                            (Optional)
                          </span>
                        </CardTitle>
                        <CardDescription>
                          Tell us about your nutritional preferences or dietary
                          objectives
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={dietaryGoal}
                          onChange={(e) => setDietaryGoal(e.target.value)}
                          placeholder="e.g., I'm looking for high-protein meals for muscle gain, or I want to reduce carbs..."
                          className="flex-1 min-h-[100px] resize-none"
                        />
                      </CardContent>
                    </Card>

                    {/* Dietary Restrictions */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          Dietary Restrictions
                          <span className="text-sm font-normal text-muted-foreground">
                            (Optional)
                          </span>
                        </CardTitle>
                        <CardDescription>
                          Tell us about any allergies, intolerances, or
                          ingredients you'd like to avoid
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={exclusions}
                          onChange={(e) => setExclusions(e.target.value)}
                          placeholder="e.g., peanuts, dairy, shellfish, mushrooms..."
                          className="flex-1 min-h-[70px] resize-none"
                        />
                      </CardContent>
                    </Card>

                    {/* Equipment Section */}
                    <Card className="col-span-1 md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          Cooking Equipment
                          <span className="text-sm font-normal text-muted-foreground">
                            (Optional)
                          </span>
                        </CardTitle>
                        <CardDescription>
                          Tell us what cooking equipment you have available -
                          this helps us suggest suitable recipes
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={equipment}
                          onChange={(e) => setEquipment(e.target.value)}
                          placeholder="e.g., oven, stovetop, slow cooker, air fryer..."
                          className="flex-1 min-h-[70px] resize-none"
                        />
                      </CardContent>
                    </Card>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Generate Recipe Button */}
              <div className="flex justify-center col-span-1 md:col-span-2">
                <Button
                  size="lg"
                  className="px-8"
                  onClick={handleGenerateRecipe}
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? "Generating..." : "Generate Recipe"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-full">
          <div className="max-w-[1400px] mx-auto mb-4">
            <Button
              variant="ghost"
              onClick={() => {
                setRecipe(null);
                onRecipeChange?.(null);
              }}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Input
            </Button>
          </div>
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6">
            <RecipeDisplay content={recipe} />
            <div className="bg-white rounded-lg p-6 md:sticky md:top-4 md:h-[calc(100vh-45rem)]">
              <h2 className="text-xl font-semibold mb-4">Modifications</h2>
              <div className="flex flex-col h-full">
                <div
                  className="flex-1 mb-4 h-[calc(100%-8rem)] overflow-y-auto pr-4"
                  ref={scrollRef}
                >
                  {modifications.map((mod, index) => (
                    <div key={index} className="mb-4">
                      <div className="flex items-start gap-2 justify-end mb-2">
                        <div className="bg-primary rounded-lg p-2 text-primary-foreground max-w-[80%]">
                          {mod.request}
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="bg-primary/10 rounded-lg p-2 max-w-[80%]">
                          {mod.response === null ? (
                            <span className="animate-pulse">...</span>
                          ) : (
                            "Changes applied to recipe"
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe your modifications (e.g., 'I don't have broccoli' or 'Make it spicier')"
                    className="resize-none"
                    rows={2}
                  />
                  <Button
                    onClick={() => handleModification(notes)}
                    disabled={isProcessingMod || !notes.trim()}
                    className="shrink-0"
                  >
                    {isProcessingMod ? "..." : "Send"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
